<template>
  <a-spin :spinning="loading">
    <a-form :form="form" layout="vertical" class="form">
      <a-form-item class="form__item" :label="$t('label.appmanager.appname')">
        <a-input
          :placeholder="placeholder.name"
          v-decorator="[
            'name',
            {
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
      </a-form-item>
      <a-form-item class="form__item" :label="$t('label.appmanager.icon')">
        <a-input
          :placeholder="placeholder.icon"
          v-decorator="[
            'icon',
            {
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
  name: 'ClusterAdd',
  components: {
    DedicateDomain
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
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) return

        this.loading = true
        api('createAppStore', {
          name: values.name,
          icon: values.icon
        }).then(response => {
          this.parentFetchData()
          this.$notification.success({
            message: '应用新增成功',
            duration: 0
          })
          this.$parent.$parent.close()
        }).catch(error => {
          this.$notification.error({
            message: `${this.$t('label.error')} ${error.response.status}`,
            description: error.response.data.createpodresponse.errortext,
            duration: 0
          })
        }).finally(() => {
          this.loading = false
        })
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
