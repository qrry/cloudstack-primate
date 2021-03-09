<template>
  <a-spin :spinning="loading">
    <a-form :form="form" layout="vertical" :class="values.id ? 'form_update' : 'form'">
      <a-form-item class="form__item" :label="$t('label.appmanager.appname')">
        <a-select
          :disabled="Boolean(values.id)"
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
        <a-textarea
          :placeholder="placeholder.name"
          v-decorator="[
            'name',
            {
              initialValue: this.name,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
          autosize
        />
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.runscript')">
        <a-textarea
          :placeholder="placeholder.runscript"
          v-decorator="[
            'runscript',
            {
              initialValue: this.runscript,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
          autosize
        />
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.instance')">
        <a-select
          :disabled="Boolean(values.id)"
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

      <a-form-item class="form__item" :label="$t('label.appmanager.ip')">
        <a-input
          :placeholder="placeholder.ip"
          v-decorator="[
            'ip',
            {
              initialValue: this.ip,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.port')">
        <a-input
          :placeholder="placeholder.port"
          v-decorator="[
            'port',
            {
              initialValue: this.port,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.login_user')">
        <a-input
          :placeholder="placeholder.login_user"
          v-decorator="[
            'login_user',
            {
              initialValue: this.login_user,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
      </a-form-item>

      <a-form-item class="form__item" :label="$t('label.appmanager.login_password')">
        <a-input
          :placeholder="placeholder.login_password"
          v-decorator="[
            'login_password',
            {
              initialValue: this.login_password,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
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
  name: 'AppStoreManageAdd',
  components: {
    DedicateDomain
  },
  props: {
    values: {
      type: Object,
      default: () => ({}),
      required: false
    }
  },
  inject: ['parentFetchData'],
  data () {
    return {
      loading: false,
      instancesList: [],
      name: '',
      instanceId: null,
      instanceName: null,
      runscript: null,
      ip: null,
      port: null,
      login_user: null,
      login_password: null,
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
        name: '请输入应用描述说明',
        runscript: '请输入运行脚本路径',
        ip: '请输入实例维护IP',
        port: '请输入实例维护端口',
        login_user: '请输入登录用户',
        login_password: '请输入登录密码'
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
      api('listAppStore', {
        listall: true,
        pagesize: 100,
        page: 1
      }).then(json => {
        if (json && json.listAppStoreResponse && json.listAppStoreResponse.appStore && json.listAppStoreResponse.appStore.length > 0) {
          this.appsList = json.listAppStoreResponse.appStore
          this.appId = this.values.appStoreId || json.listAppStoreResponse.appStore[0].id
          this.name = this.values.description
          this.runscript = this.values.run_script
          this.ip = this.values.ip
          this.port = this.values.port
          this.login_user = this.values.login_user
          this.login_password = this.values.login_password
        }
      })
    },
    fetchAppStatus () {
      this.appStatusList = [{ id: 0, name: '未安装' },
        { id: 1, name: '已安装' }]
      this.appStatusId = this.values.state || this.appStatusList[0].id
    },
    fetchInstances () {
      this.loading = true
      api('listVirtualMachinesMetrics', {
        listall: true,
        page: 1,
        pagesize: 100
      }).then(response => {
        this.instancesList = response.listvirtualmachinesmetricsresponse.virtualmachine || []
        this.instanceId = this.values.instanceId || this.instancesList[0].id
        this.params = this.$store.getters.apis.createPod.params
        // Object.keys(this.placeholder).forEach(item => { this.returnPlaceholder(item) })
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
        let obj = {}
        obj = this.instancesList.find((item) => {
          return item.id === values.instanceid
        })

        const apiName = this.values.id ? 'updateAppManage' : 'createAppManage'
        api(apiName, {
          app_store_id: values.appid,
          instance_id: values.instanceid,
          instance_name: obj.name,
          run_script: values.runscript,
          ip: values.ip,
          port: values.port,
          login_user: values.login_user,
          login_password: values.login_password,
          description: values.name,
          state: values.appStatusid,
          ...this.values.id && {
            id: this.values.id
          }
        }).then(response => {
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
    returnPlaceholder (field) {
      this.params.find(i => {
        if (i.name === field) this.placeholder[field] = i.description
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .form, .form_update {

    &__label {
      margin-bottom: 5px;
    }

    &__item {
      margin-bottom: 20px;
    }
  }

  .form {
    .ant-select, .ant-input {
      width: 400px;
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
