<template>
  <div>
    <a-row :gutter="12">
      <a-col :md="24">
        <a-card class="breadcrumb-card">
          <a-col :md="16" style="display: flex">
            <breadcrumb style="padding-top: 6px; padding-left: 8px" />
            <a-button
              style="margin-left: 12px; margin-top: 4px"
              :loading="loading"
              icon="reload"
              size="small"
              shape="round"
              @click="fetchData()" >
              {{ $t('label.refresh') }}
            </a-button>
          </a-col>
          <a-col :span="8">
            <span style="float: right">
              <action-button
                :actions="actions"
                :loading="loading"
                @exec-action="execAction"/>
            </span>
          </a-col>
        </a-card>
      </a-col>
      <div v-for="item in stats" :key="item.id">
        <a-col
          :md="6"
          style="margin-bottom: 12px"
        >
          <chart-card :loading="loading">
            <div class="chart-card-inner">
              <router-link :to="{ name: 'appManager' }">
                <h2>{{ item.name }}</h2>
                <h2><a-icon type="security-scan"/>{{ item.instanceCount }}</h2>
              </router-link>
            </div>
          </chart-card>
        </a-col>
      </div>
    </a-row>
    <a-pagination
      class="row-element"
      size="small"
      :current="page"
      :pageSize="pageSize"
      :total="itemCount"
      :showTotal="total => `${$t('label.showing')} ${Math.min(total, 1+((page-1)*pageSize))}-${Math.min(page*pageSize, total)} ${$t('label.of')} ${total} ${$t('label.items')}`"
      :pageSizeOptions="['10', '20', '50', '100', '200']"
      @change="changePage"
      @showSizeChange="changePageSize"
      showSizeChanger
      showQuickJumper>
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }} / {{ $t('label.page') }}</span>
      </template>
    </a-pagination>
    <div v-if="showFormAction">
      <keep-alive v-if="currentAction.component">
        <a-modal
          :title="$t(currentAction.label)"
          :visible="showFormAction"
          :closable="true"
          :maskClosable="false"
          :cancelText="$t('label.cancel')"
          style="top: 20px;"
          @cancel="onCloseAction"
          :confirmLoading="actionLoading"
          :footer="null"
          centered>
          <component
            :is="currentAction.component"
            :action="currentAction" />
        </a-modal>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import { api } from '@/api'
import router from '@/router'

import Breadcrumb from '@/components/widgets/Breadcrumb'
import ChartCard from '@/components/widgets/ChartCard'
import ActionButton from '@/components/view/ActionButton'

export default {
  name: 'InfraSummary',
  components: {
    Breadcrumb,
    ChartCard,
    ActionButton
  },
  data () {
    return {
      loading: true,
      routes: {},
      sections: ['zones', 'pods', 'clusters', 'hosts', 'storagepools', 'imagestores', 'systemvms', 'routers', 'cpusockets', 'managementservers', 'alerts', 'ilbvms'],
      sslFormVisible: false,
      stats: [],
      intermediateCertificates: [],
      sslFormSubmitting: false,
      maxCerts: 0,
      page: 1,
      pageSize: 10,
      itemCount: 0,
      showFormAction: false,
      currentAction: {},
      actionLoading: false
    }
  },
  computed: {
    actions () {
      let actions = []
      if (this.$route && this.$route.meta) {
        if (this.$route.meta.actions) {
          actions = this.$route.meta.actions
        }
      }
      return actions
    }
  },
  provide: function () {
    return {
      parentFetchData: this.fetchData
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
    this.apiParams = {}
    var apiConfig = this.$store.getters.apis.uploadCustomCertificate || {}
    apiConfig.params.forEach(param => {
      this.apiParams[param.name] = param
    })
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.routes = {}
      for (const section of this.sections) {
        const node = router.resolve({ name: section.substring(0, section.length - 1) })
        this.routes[section] = {
          title: node.route.meta.title,
          icon: node.route.meta.icon
        }
      }
      this.listInfra()
    },
    onCloseAction () {
      this.currentAction = {}
      this.showFormAction = false
    },
    execAction (action) {
      this.currentAction = action
      this.showFormAction = true
    },
    listInfra () {
      this.loading = true
      api('listAppStoreApis', {
        listall: true,
        pagesize: this.pageSize,
        page: this.page
      }).then(json => {
        if (json && json.listAppStoreResponse && json.listAppStoreResponse.appStore) {
          this.stats = json.listAppStoreResponse.appStore
          this.itemCount = json.listAppStoreResponse.count
        }
      }).finally(f => {
        this.loading = false
      })
    },
    changePage (page, pageSize) {
      this.page = page
      this.pageSize = pageSize
      this.fetchData()
    },
    changePageSize (currentPage, pageSize) {
      this.page = currentPage
      this.pageSize = pageSize
      this.fetchData()
    },
    pollActionCompletion (jobId, count) {
      api('queryAsyncJobResult', { jobid: jobId }).then(json => {
        const result = json.queryasyncjobresultresponse
        if (result.jobstatus === 1 && this.maxCerts === count) {
          this.$message.success(`${this.$t('label.certificate.upload')}: ${result.jobresult.customcertificate.message}`)
          this.$notification.success({
            message: this.$t('label.certificate.upload'),
            description: result.jobresult.customcertificate.message || this.$t('message.success.certificate.upload')
          })
        } else if (result.jobstatus === 2) {
          this.$notification.error({
            message: this.$t('label.certificate.upload.failed'),
            description: result.jobresult.errortext || this.$t('label.certificate.upload.failed.description'),
            duration: 0
          })
        } else if (result.jobstatus === 0) {
          this.$message
            .loading(`${this.$t('message.certificate.upload.processing')}: ${count}`, 2)
            .then(() => this.pollActionCompletion(jobId, count))
        }
      }).catch(e => {
        console.log(this.$t('error.fetching.async.job.result') + e)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

  .breadcrumb-card {
    margin-left: -24px;
    margin-right: -24px;
    margin-top: -16px;
    margin-bottom: 12px;
  }

  .chart-card-inner {
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
  }
  .intermediate-certificate {
    opacity: 1;
    transform: none;
    transition: opacity 0.2s ease 0s, transform 0.5s ease;
    will-change: transform;
  }
  .intermediate-certificate.fadeInUp-enter-active {
    opacity: 0;
    transform: translateY(10px);
    transition: none;
  }
  .controls {
    display: flex;
    justify-content: flex-end;
  }
  .close-button {
    margin-right: 20px;
  }
  .ant-form-item {
    margin-bottom: 10px;
  }
</style>
