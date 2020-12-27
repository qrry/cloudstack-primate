import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locales'

import bootstrap from './core/bootstrap'
import './core/use'
import './core/ext'
import './permission' // permission control
import './utils/filter' // global filter
import { pollJobPlugin, notifierPlugin, toLocaleDatePlugin } from './utils/plugins'
import { VueAxios } from './utils/request'

Vue.config.productionTip = false
Vue.use(VueAxios, router)
Vue.use(pollJobPlugin)
Vue.use(notifierPlugin)
Vue.use(toLocaleDatePlugin)

fetch('config.json').then(response => response.json()).then(config => {
  Vue.prototype.$config = config
  Vue.axios.defaults.baseURL = config.apiBase
  new Vue({
    router,
    store,
    i18n,
    created: bootstrap,
    render: h => h(App)
  }).$mount('#app')
})
