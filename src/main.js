import Vue from 'vue'
import Resource from 'vue-resource'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(Resource)

new Vue({
  render: h => h(App),
}).$mount('#app')
