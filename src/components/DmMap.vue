<template>
  <div class="dm-map">
    <svg
      class="dm-svg"
      :style="style"
    >
      <g class="dm-countries" :transform="transform">
        <dm-country
          v-for="(country, index) in countries"
          :key="country.properties.id || country.properties.NAME || index"
          :data="stachData(country)"
          :d="topo(world, country)"
          :countryOnClick="countryOnClick"
          :countryOnHover="countryOnHover"
          :countryOnMount="countryOnMount"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import DmCountry from './DmCountry'
import { geoPath, geoMercator } from 'd3-geo'
import { mesh } from 'topojson'
export default {
  name: 'DmMap',
  components: {
    DmCountry
  },
  props: {
    // Static props
    source: {
      type: String,
      default: '/topos/world110m.json'
    },
    data: {
      type: Array,
      default () { return []}
    },
    // Handlers
    countryOnClick: {
      type: Function,
      default: function (e, country) { }
    },
    countryOnHover: {
      type: Function,
      default: function (e, country) { }
    },
    countryOnMount: {
      type: Function,
      default: function (country) { }
    },
    attachData: {
      type: Function,
      default: function (country) { return null}
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
      this.height = this.$el.offsetHeight
    },
    load () {
      this.$http.get(this.source)
        .then(res => {
          this.world = res.body
          this.countries = res.body.objects
        }, err => {
          console.error(err)
        })
    },
    topo (world, country) {
      return this.geoPath(mesh(world, country))
    },
    stachData (country) {
      country.userData = this.attachData(country)
      return country
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
