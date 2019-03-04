<template>
  <dm-map/>
</template>

<script>
import DmMap from './components/DmMap'
export default {
  name: 'App',
  components: {
    DmMap
  },
  data () {
    return {
      data: [],
      source: '/topos/world110m.json'
    }
  },
  mounted () {
    this.load('/data/gdp.json')
    // this.center.color = '#555'
  },
  provide () {
    const map = {data: [], world: { objects: []}}
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
</script>

<style>
.dm-map {
  width: 960px;
  height: 602px;
  border: #000 solid 1px;
  background-color:#4499bb;
}
</style>
