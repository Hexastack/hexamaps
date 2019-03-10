import Vue from 'vue'
import DmMap from './components/DmMap'
import config from './config'

const App = {
  name: 'App',
  components: {
    DmMap
  },
  render: h => h('dm-map'),
  data () {
    return {
      data: [],
      source: config.mapSource
    }
  },
  mounted () {
    this.load(config.dataSource)
  },
  provide () {
    const map = {data: [], source: '', world: { objects: []}}
    Object.defineProperty(map, 'data', {
       enumerable: true,
       get: () => this.data
    })
    Object.defineProperty(map, 'source', {
       enumerable: true,
       get: () => this.source
    })
    return { map }
  },
  methods: {
    load (dataSource) {
      fetch(dataSource)
        .then(response => {
          return response.json()
        })
        .then(json => {
          this.data = json
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
