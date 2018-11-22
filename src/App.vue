<template>
  <index/>
</template>

<script>
import index from '../examples/Choropleth/Index'
export default {
  name: 'App',
  components: {
    index
  },
  data () {
    return {
      data: [],
      source: '/topos/world110m.json'
    }
  },
  mounted () {
    this.load('/data/gdp.json')
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
body {
  margin: 10px;
}
</style>
