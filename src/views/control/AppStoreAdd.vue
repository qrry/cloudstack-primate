// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

<template>
  <a-spin :spinning="loading">
    <a-form :form="form" layout="vertical" class="form">

      <a-form-item class="form__item" :label="$t('label.appmanager.appname')">
        <a-select
          v-decorator="['appid', {
            initialValue: this.appId,
            rules: [{ required: true, message: `${$t('label.required')}` }] }
          ]">
          <a-select-option
            v-for="app in appsList"
            :value="app.id"
            :key="app.id">
            {{ app.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.appdescription')">
        <a-input
          :placeholder="placeholder.name"
          v-decorator="[
            'name',
            {
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.instance')">
        <a-select
          v-decorator="['instanceid', {
            initialValue: this.instanceId,
            rules: [{ required: true, message: `${$t('label.required')}` }] }
          ]">
          <a-select-option
            v-for="instance in instancesList"
            :value="instance.id"
            :key="instance.id">
            {{ instance.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.appstatus')">
        <a-select
          v-decorator="['appStatusid', {
            initialValue: this.appStatusId,
            rules: [{ required: true, message: `${$t('label.required')}` }] }
          ]">
          <a-select-option
            v-for="appStatus in appStatusList"
            :value="appStatus.id"
            :key="appStatus.id">
            {{ appStatus.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-divider></a-divider>

      <div class="actions">
        <a-button @click="() => this.$parent.$parent.close()">{{ $t('label.cancel') }}</a-button>
        <a-button @click="handleSubmit" type="primary">{{ $t('label.ok') }}</a-button>
      </div>

    </a-form>
  </a-spin>
</template>

<script>
import { api } from '@/api'
import DedicateDomain from '../../components/view/DedicateDomain'

export default {
  name: 'ClusterAdd',
  components: {
    DedicateDomain
  },
  props: {
    resource: {
      type: Object,
      required: true
    }
  },
  inject: ['parentFetchData'],
  data () {
    return {
      loading: false,
      instancesList: [],
      instanceId: null,
      appsList: [],
      appId: null,
      appStatusList: [],
      appStatusId: null,
      showDedicated: false,
      dedicatedDomainId: null,
      dedicatedAccount: null,
      domainError: false,
      params: [],
      placeholder: {
        name: null,
        gateway: null,
        netmask: null,
        startip: null,
        endip: null
      }
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.fetchApps()
      this.fetchAppStatus()
      this.fetchInstances()
    },
    fetchApps () {
      this.appsList = [{ id: 1, name: 'SFTP' },
        { id: 2, name: 'TCPDUMP' },
        { id: 3, name: 'NMAP' },
        { id: 4, name: 'Nginx' },
        { id: 5, name: 'Apache Http' },
        { id: 6, name: 'MySql' }]
      this.appId = this.appsList[0].id
    },
    fetchAppStatus () {
      this.appStatusList = [{ id: 0, name: '未安装' },
        { id: 1, name: '已安装' }]
      this.appStatusId = this.appStatusList[0].id
    },
    fetchInstances () {
      this.loading = true
      api('listInstanceGroups').then(response => {
        this.instancesList = response.listinstancegroupsresponse.instancegroup || []
        this.instanceId = this.instancesList[0].id
        this.params = this.$store.getters.apis.createPod.params
        Object.keys(this.placeholder).forEach(item => { this.returnPlaceholder(item) })
      }).catch(error => {
        this.$notifyError(error)
      }).finally(() => {
        this.loading = false
      })
    },
    toggleDedicate () {
      this.dedicatedDomainId = null
      this.dedicatedAccount = null
      this.showDedicated = !this.showDedicated
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) return

        this.loading = true
        api('createPod', {
          zoneId: values.zoneid,
          name: values.name,
          gateway: values.gateway,
          netmask: values.netmask,
          startip: values.startip,
          endip: values.endip
        }).then(response => {
          const pod = response.createpodresponse.pod || {}
          if (pod.id && this.showDedicated) {
            this.dedicatePod(pod.id)
          }
          this.loading = false
          this.parentFetchData()
          this.$parent.$parent.close()
        }).catch(error => {
          this.$notification.error({
            message: `${this.$t('label.error')} ${error.response.status}`,
            description: error.response.data.createpodresponse.errortext,
            duration: 0
          })
          this.loading = false
        })
      })
    },
    dedicatePod (podId) {
      this.loading = true
      api('dedicatePod', {
        podId,
        domainid: this.dedicatedDomainId,
        account: this.dedicatedAccount
      }).then(response => {
        this.$pollJob({
          jobId: response.dedicatepodresponse.jobid,
          successMessage: this.$t('message.pod.dedicated'),
          successMethod: () => {
            this.loading = false
            this.$store.dispatch('AddAsyncJob', {
              title: this.$t('message.pod.dedicated'),
              jobid: response.dedicatepodresponse.jobid,
              description: `${this.$t('label.domainid')} : ${this.dedicatedDomainId}`,
              status: 'progress'
            })
          },
          errorMessage: this.$t('error.dedicate.pod.failed'),
          errorMethod: () => {
            this.loading = false
          },
          loadingMessage: this.$t('message.dedicating.pod'),
          catchMessage: this.$t('error.fetching.async.job.result'),
          catchMethod: () => {
            this.loading = false
          }
        })
      }).catch(error => {
        this.$notification.error({
          message: `${this.$t('label.error')} ${error.response.status}`,
          description: error.response.data.errorresponse.errortext,
          duration: 0
        })
        this.loading = false
      })
    },
    returnPlaceholder (field) {
      this.params.find(i => {
        if (i.name === field) this.placeholder[field] = i.description
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .form {

    &__label {
      margin-bottom: 5px;
    }

    &__item {
      margin-bottom: 20px;
    }

    .ant-select {
      width: 85vw;

      @media (min-width: 760px) {
        width: 400px;
      }
    }

  }

  .actions {
    display: flex;
    justify-content: flex-end;

    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }

  }

  .required {
    color: #ff0000;

    &-label {
      display: none;

      &--visible {
        display: block;
      }

    }

  }
</style>
