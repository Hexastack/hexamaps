<template>
  <div class="dm-choropleth">
    <dm-map
      :source="source"
      :data="data"
      :countryOnClick="countryOnClick"
      :countryOnHover="countryOnHover"
      :countryOnMount="countryOnMount"
      :attachData="attachData"
    />
  </div>
</template>

<script>
import { interpolateOranges } from 'd3-scale-chromatic'
import { scaleLinear } from 'd3-scale'
import DmMap from '../../src/components/DmMap'
export default {
  name: 'Choropleth',
  components: {
    DmMap
  },
  props: {
    source: {
      type: String,
      default: '/topos/world110m.json'
    },
    data: {
      type: Array,
      default () { return []}
    },
    descriminator: {
      type: String,
      default: 'ISO_A2'
    }
  },
  methods: {
    countryOnClick (e, country) {
      for (let d in country.data.properties) {
        console.log(d, country.data.properties[d])
      } 
      country.land = '#cc0044'
      return country
    },
    countryOnHover (e, country) {
      country.land = '#0000c4'
      return country
    },
    countryOnMount (country) {
      if (country.data.userData && country.data.userData.value) {
        country.land = interpolateOranges(this.scale(country.data.userData.value))
      }
      return country
    },
    attachData (country) {
      return this.data.find(d => d.name === country.properties[this.descriminator])
    }
  },
  computed: {
    scale () {
      return scaleLinear().domain([Math.min(...this.data.map(d => d.value)), Math.max(...this.data.map(d => d.value))])
    }
  }
}
</script>

<style>
</style>
