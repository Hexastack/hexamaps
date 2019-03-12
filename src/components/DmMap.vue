<template>
  <div class="dm-map">
    <svg
      class="dm-svg"
      :style="style"
    >
      <g class="dm-countries" :transform="transform">
        <path v-if="withGraticule" stroke="#ccc" fill="none" class="dm-graticules" :d="graticule()"/>
        <dm-entity
          v-for="(entity, index) in countries"
          :key="entity.properties.id || entity.properties.NAME || index"
          :d="topo(world, entity)"
          :data="entity.properties"
          :centroid="centroid(world, entity)"
          :type="'A' + entity.properties.LEVEL"
        />
      </g>
      <slot/>
    </svg>
  </div>
</template>

<script>
import DmEntity from './DmEntity'
import { geoPath, geoCentroid, geoGraticule } from 'd3-geo'
import {
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  geoEqualEarth,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoMercator,
  geoTransverseMercator,
  geoNaturalEarth1
} from 'd3-geo'
import * as Projections from 'd3-geo-projection'
import { mesh } from 'topojson'

const projections = Object.assign({
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  geoEqualEarth,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoMercator,
  geoTransverseMercator,
  geoNaturalEarth1
}, Projections)

export default {
  name: 'DmMap',
  components: {
    DmEntity
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
    projection: {
      type: String,
      default: 'geoMercator'
    },
    withGraticule: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: 'layer'
    },
    type: {
      type: String,
      default: 'map'
    }
  },
  data () {
    return {
      width: 800,
      height: 600,
      panning: false,
      zooming: false,
      countries: [],
      geoPath: function () { return '' },
      scale: 1,
      x: 0,
      y: 0,
      angle: 0
    }
  },
  mounted () {
    this.resize()
    window.addEventListener('resize', this.resize)
    this.load()
    const projection = projections[this.projection] ? projections[this.projection] : projections.geoMercator
    this.geoPath = geoPath().projection(projection())
  },
  watch: {
    projection (newProjection) {
      const projection = projections[this.projection] ? projections[this.projection] : projections.geoMercator
      this.geoPath = geoPath().projection(projection())
    },
    'map.source' () {
      this.load()
      // this.$forceUpdate()
    }
  },
  methods: {
    resize () {
      this.width = this.$el.offsetWidth
      this.height = this.$el.offsetHeight - 4
    },
    load () {
      fetch(this.map.source)
        .then(response => {
          return response.json()
        })
        .then(json => {
          this.world = json
          this.countries = json.objects
        })
        .catch(err => {
          console.error(err)
        })
    },
    topo (world, entity) {
      return this.geoPath(mesh(world, entity))
    },
    graticule () {
      return this.geoPath(geoGraticule()())
    },
    centroid (world, entity) {
      return this.geoPath.centroid(mesh(world, entity))
    }
  },
  computed: {
    style () {
      return { height: `${this.height}px`, width: `${this.width}px` }
    },
    wRatio () {
      return this.width / 800
    },
    hRatio () {
      return this.height / 600
    },
    transform () {
      return `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.angle})`
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
  }
}
</script>

<style>
</style>
