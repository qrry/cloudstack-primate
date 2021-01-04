<template>
  <a-spin :spinning="loading">
    <a-form :form="form" layout="vertical" class="form">
      <a-form-item class="form__item" :label="$t('label.appStore.appName')">
        <a-input
          :placeholder="placeholder.name"
          v-decorator="[
            'name',
            {
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }]"
        />
      </a-form-item>
      <a-form-item class="form__item" :label="$t('label.appStore.appDescription')">
        <a-textarea
          :placeholder="placeholder.description"
          v-decorator="[
            'description']"
          autoSize
        />
      </a-form-item>
      <a-form-item class="form__item" :label="$t('label.appStore.appIcon')">
        <a-select
          v-decorator="['icon', {
            rules: [{ required: true, message: `${$t('label.required')}` }] }
          ]">
          <a-select-option
            v-for="icon in icons"
            :value="icon"
            :key="icon">
            {{ icon }}
            <a-icon :type="icon" style="float: right" />
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="form__item" :label="$t('label.appStore.runScript')">
        <a-textarea
          :placeholder="placeholder.runScript"
          v-decorator="['runScript', {rules: [{ required: true, message: `${$t('label.required')}` }] }]"
          autoSize
        />
      </a-form-item>
      <a-form-item class="form__item" :label="$t('label.appStore.remark')">
        <a-textarea
          :placeholder="placeholder.remark"
          v-decorator="[
            'remark']"
          autoSize
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
import icons from './icons'

export default {
  name: 'ClusterAdd',
  components: {
    DedicateDomain
  },
  inject: ['parentFetchData'],
  data () {
    return {
      loading: false,
      icons: icons,
      placeholder: {
        name: null,
        description: null,
        icon: null
      }
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
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
