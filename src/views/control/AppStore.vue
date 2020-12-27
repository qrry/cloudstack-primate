<template>
  <a-row :gutter="12">
    <a-col :md="24">
      <a-card class="breadcrumb-card">
        <a-col :md="24" style="display: flex">
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
      </a-card>
    </a-col>
    <a-col
      :md="6"
      style="margin-bottom: 12px">
      <chart-card :loading="loading">
        <div class="chart-card-inner">
          <router-link :to="{ name: 'appManager' }">
            <h2>{{ $t('SFTP') }}</h2>
            <h2><a-icon type="security-scan"/>0</h2>
          </router-link>
        </div>
      </chart-card>
    </a-col>
    <a-col
      :md="6"
      style="margin-bottom: 12px">
      <chart-card :loading="loading">
        <div class="chart-card-inner">
          <router-link :to="{ name: 'appManager' }">
            <h2>{{ $t('TCPDUMP') }}</h2>
            <h2><a-icon type="safety"/>1</h2>
          </router-link>
        </div>
      </chart-card>
    </a-col>
    <a-col
      :md="6"
      style="margin-bottom: 12px">
      <chart-card :loading="loading">
        <div class="chart-card-inner">
          <router-link :to="{ name: 'appManager' }">
            <h2>{{ $t('NMAP') }}</h2>
            <h2><a-icon type="monitor"/>0</h2>
          </router-link>
        </div>
      </chart-card>
    </a-col>
    <a-col
      :md="6"
      style="margin-bottom: 12px">
      <chart-card :loading="loading">
        <div class="chart-card-inner">
          <router-link :to="{ name: 'appManager' }">
            <h2>{{ $t('Nginx') }}</h2>
            <h2><a-icon type="shake"/>0</h2>
          </router-link>
        </div>
      </chart-card>
    </a-col>
    <a-col
      :md="6"
      style="margin-bottom: 12px">
      <chart-card :loading="loading">
        <div class="chart-card-inner">
          <router-link :to="{ name: 'appManager' }">
            <h2>{{ $t('Apache Http') }}</h2>
            <h2><a-icon type="api"/>0</h2>
          </router-link>
        </div>
      </chart-card>
    </a-col>
    <a-col
      :md="6"
      style="margin-bottom: 12px">
      <chart-card :loading="loading">
        <div class="chart-card-inner">
          <router-link :to="{ name: 'appManager' }">
            <h2>{{ $t('MySql') }}</h2>
            <h2><a-icon type="block"/>0</h2>
          </router-link>
        </div>
      </chart-card>
    </a-col>
  </a-row>
</template>

<script>
import { api } from '@/api'
import router from '@/router'

import Breadcrumb from '@/components/widgets/Breadcrumb'
import ChartCard from '@/components/widgets/ChartCard'

export default {
  name: 'InfraSummary',
  components: {
    Breadcrumb,
    ChartCard
  },
  data () {
    return {
      loading: true,
      routes: {},
      sections: ['zones', 'pods', 'clusters', 'hosts', 'storagepools', 'imagestores', 'systemvms', 'routers', 'cpusockets', 'managementservers', 'alerts', 'ilbvms'],
      sslFormVisible: false,
      stats: {},
      intermediateCertificates: [],
      sslFormSubmitting: false,
      maxCerts: 0
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
    listInfra () {
      this.loading = true
      api('listAppStoreApis', {
        listall: true,
        pagesize: 20,
        page: 1
        // todo 分页
      }).then(json => {
        this.stats = []
        if (json && json.listinfrastructureresponse && json.listinfrastructureresponse.infrastructure) {
          this.stats = json.listinfrastructureresponse.infrastructure
        }
      }).finally(f => {
        this.loading = false
      })
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
    },

    handleSslFormSubmit () {
      this.sslFormSubmitting = true

      this.form.validateFields(errors => {
        if (errors) {
          this.sslFormSubmitting = false
          return
        }

        const formValues = this.form.getFieldsValue()

        this.maxCerts = 2 + Object.keys(formValues).length
        let count = 1
        let data = {
          id: count,
          certificate: formValues.root,
          domainsuffix: formValues.dns,
          name: 'root'
        }
        api('uploadCustomCertificate', {}, 'POST', data).then(response => {
          this.pollActionCompletion(response.uploadcustomcertificateresponse.jobid, count)
        }).then(() => {
          this.sslModalClose()
        })

        Object.keys(formValues).forEach(key => {
          if (key.includes('intermediate')) {
            count = count + 1
            const data = {
              id: count,
              certificate: formValues[key],
              domainsuffix: formValues.dns,
              name: key
            }
            api('uploadCustomCertificate', {}, 'POST', data).then(response => {
              this.pollActionCompletion(response.uploadcustomcertificateresponse.jobid, count)
            }).then(() => {
              this.sslModalClose()
            })
          }
        })

        count = count <= 2 ? 3 : count + 1
        data = {
          id: count,
          certificate: formValues.server,
          domainsuffix: formValues.dns,
          privatekey: formValues.pkcs
        }
        api('uploadCustomCertificate', {}, 'POST', data).then(response => {
          this.pollActionCompletion(response.uploadcustomcertificateresponse.jobid, count)
        }).then(() => {
          this.sslModalClose()
        })
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
