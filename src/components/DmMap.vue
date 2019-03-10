<template>
  <div class="dm-map">
    <svg
      class="dm-svg"
      :style="style"
    >
      <g class="dm-countries" :transform="transform">
        <dm-entity
          v-for="(entity, index) in countries"
          :key="entity.properties.id || entity.properties.NAME || index"
          :d="topo(world, entity)"
          :data="entity.properties"
          :centroid="centroid(world, entity)"
          :type="'A' + entity.properties.LEVEL"

          :entityOnClick="entityOnClick"
          :entityOnHover="entityOnHover"
        />
      </g>
      <slot/>
    </svg>
  </div>
</template>

<script>
import DmEntity from './DmEntity'
import { 
  geoPath, geoCentroid,
  geoMercator 
} from 'd3-geo'
import { mesh } from 'topojson'
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
    category: {
      type: String,
      default: 'layer'
    },
    type: {
      type: String,
      default: 'map'
    },
    // Event Handlers
    entityOnClick: {
      type: Function,
      default: function (e, entity) { }
    },
    entityOnHover: {
      type: Function,
      default: function (e, entity) { }
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
    this.geoPath = geoPath().projection(geoMercator())
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
