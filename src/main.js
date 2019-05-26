// This is the main entry point to the lib, it is used only to execute the lib by itself.
// The lib by itself, only displays the map without any features.
// Usually these features are provided by plugins, that are queued and compiled by the transpiler.
// This file is not bundled within the HexaMaps build.
import Vue from 'vue'
import Map from './components/HmMap'
import config from './config'
import transpile from './lib/transpile'
import addons from './addons'

// Transpiling plugins
const plugins = transpile(addons)

// Creating a map component that uses the transpiled plugins
const HmMap = Map(plugins)
const App = {
  name: 'HexaMap',
  render: function (createElement) {
    return createElement (
      HmMap,
      {props:
        {
          projectionName: this.projectionName,
          withGraticule: this.withGraticule
        }
      }
    )
  },
  data () {
    // data and source are also injected in the subsequent components
    return {
      // data is in fact the user's data
      data: [],
      // source is initially loaded from config
      source: config.mapSource,
      projectionName: config.projectionName,
      withGraticule: config.withGraticule
    }
  },
  mounted () {
    // Loading the user's data
    this.load(config.dataSource)
  },
  provide () {
    const map = {data: [], source: ''}
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
          // consider default stashing here
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}

Vue.config.productionTip = false

Vue.use(plugins.entry)

new Vue({
  render: h => h(App),
}).$mount('#app')
