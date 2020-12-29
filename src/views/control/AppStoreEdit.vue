<template>
  <a-spin :spinning="loading">
    <a-form :form="form" layout="vertical" class="form">
      <a-form-item class="form__item" :label="$t('label.appmanager.appname')">
        <a-input
          :placeholder="placeholder.name"
          v-decorator="[
            'name',
            {
              initialValue: resource.name,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }
          ]"
        />
      </a-form-item>
      <a-form-item class="form__item" :label="$t('label.appmanager.icon')">
        <a-select
          v-decorator="[
            'icon',
            {
              initialValue: resource.icon,
              rules: [{ required: true, message: `${$t('label.required')}` }]
            }
          ]"
        >
          <a-select-option v-for="icon in icons" :value="icon" :key="icon">
            {{ icon }}
            <a-icon :type="icon" style="float: right" />
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
import icons from './icons'

export default {
  name: 'AppStoreEdit',
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
        icon: null
      },
      resource: {}
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
    if (this.$route.params.id) {
      this.fetchData()
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  methods: {
    async fetchData () {
      if (String(this.resource.id) === this.$route.params.id) {
        return
      }
      this.loading = true
      await this.fetchApplication()
    },
    fetchApplication () {
      return new Promise((resolve, reject) => {
        api('listAppStore', {
          listAll: true,
          id: this.$route.params.id,
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
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (err) return

        this.loading = true
        api('updateAppStore', {
          id: this.$route.params.id,
          name: values.name,
          icon: values.icon
        })
          .then(response => {
            this.parentFetchData()
            this.$parent.$parent.close()
          })
          .catch(error => {
            this.$notification.error({
              message: `${this.$t('label.error')} ${error.response.status}`,
              description: error.response.data.updateAppStoreResponse.errortext,
              duration: 0
            })
          })
          .finally(() => {
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
