import Vue from 'vue'
import App from './App'
// import choro from '../examples/choro'
import center from '../examples/plugins/center/transpile'
console.log(center)
Vue.config.productionTip = false

// Vue.use(choro)
Vue.use(center)

new Vue({
  render: h => h(App),
}).$mount('#app')
