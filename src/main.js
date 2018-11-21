import Vue from 'vue'
import index from '../examples/Choropleth/Index.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(index),
}).$mount('#app')
