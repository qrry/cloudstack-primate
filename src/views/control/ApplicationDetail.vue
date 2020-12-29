<template>
  <div>
    <a-row :gutter="12">
      <a-col :md="24">
        <a-card class="breadcrumb-card">
          <a-col :md="14" style="display: flex">
            <breadcrumb style="padding-top: 6px; padding-left: 8px" />
            <a-button
              style="margin-left: 12px; margin-top: 4px"
              :loading="loading"
              icon="reload"
              size="small"
              shape="round"
              @click="fetchApplication()"
            >
              {{ $t('label.refresh') }}
            </a-button>
          </a-col>
          <a-col :span="10">
            <span style="float: right">
              <action-button
                :style="{ float: 'right' }"
                :loading="loading"
                :actions="actions"
                :resource="resource"
                :dataView="true"
                @exec-action="execAction"
              />
            </span>
          </a-col>
        </a-card>
      </a-col>
    </a-row>
    <div v-for="item in Object.keys(resource)" :key="item.id">
      <chart-card :loading="loading" v-if="item !== 'id'">
        <div class="chart-card-inner">
          <a-col :md="6">{{ item }}</a-col>
          <a-col :md="18">
            <span v-if="item !== 'icon'">{{ resource[item] }}</span>
            <span v-else><a-icon :type="resource[item]"/></span>
          </a-col>
        </div>
      </chart-card>
    </div>
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
          centered
        >
          <component :is="currentAction.component" :action="currentAction" />
        </a-modal>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import { api } from '@api'
import Breadcrumb from '@/components/widgets/Breadcrumb'
import ChartCard from '@/components/widgets/ChartCard'
import ActionButton from '@/components/view/ActionButton'

export default {
  name: 'ApplicationDetail',
  components: {
    ActionButton,
    Breadcrumb,
    ChartCard
  },
  inject: ['parentFetchData'],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      actions: [],
      resource: {},
      showFormAction: false,
      currentAction: {},
      actionLoading: false
    }
  },
  watch: {
    resource () {
      if (this.id) {
        this.fetchData()
      }
    }
  },
  mounted () {
    this.actions = this.$route.meta.actions
    if (this.id) {
      this.fetchData()
    }
  },
  methods: {
    fetchData () {
      if (String(this.resource.id) === this.id) {
        return
      }
      this.fetchApplication().then(() => this.parentFetchData())
    },
    fetchApplication () {
      this.loading = true
      return new Promise((resolve, reject) => {
        api('listAppStore', {
          listAll: true,
          id: this.id,
          page: 1,
          pagesize: 1
        })
          .then(json => {
            if (json.listAppStoreResponse && json.listAppStoreResponse.appStore) {
              this.resource = json.listAppStoreResponse.appStore[0]
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    changeResource (resource) {
      this.resource = resource
    },
    onCloseAction () {
      this.currentAction = {}
      this.showFormAction = false
    },
    execAction (action, isGroupAction) {
      if (action.api === 'updateAppStore') {
        this.currentAction = action
        this.showFormAction = true
      } else if (action.api === 'deleteAppStore') {
        api('deleteAppStore', {
          id: this.id
        })
          .then(json => {
            if (json.deleteAppStoreResponse.success) {
              this.parentFetchData()
              this.$router.push({ name: 'appStore' })
            }
          })
          .catch(error => {
            this.$notification.error({
              message: `${this.$t('label.error')} ${error.response.status}`,
              description: error.response.data.deleteAppStoreResponse.errortext,
              duration: 0
            })
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .chart-card-inner {
    white-space: nowrap;
    overflow: hidden;
  }
</style>
