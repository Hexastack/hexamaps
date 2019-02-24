<template>
  <div class="dm-choropleth">
    <dm-map
      :attachData="attachData"
      :entityDrawLand="entityDrawLand"
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
  inject: {
    map: {
      type: Object,
      default () {
        return {
          data: [],
          source: '/topos/world110m.json'
        }
      }
    }
  },
  props: {
    descriminator: {
      type: String,
      default: 'ISO_A2'
    }
  },
  methods: {
    entityDrawLand (entity) {
      if (entity.data.userData && entity.data.userData.value) {
        return interpolateOranges(this.scale(entity.data.userData.value))
      }
      return entity.land
    },
    attachData (entity) {
      return this.map.data.find(d => d.name === entity.properties[this.descriminator])
    }
  },
  computed: {
    scale () {
      return scaleLinear().domain([Math.min(...this.map.data.map(d => d.value)), Math.max(...this.map.data.map(d => d.value))])
    }
  }
}
</script>

<style>
</style>
