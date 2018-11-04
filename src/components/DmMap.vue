<template>
  <div class="dm-map">
    <svg
      class="dm-svg"
      :style="style"
    >
      <g class="dm-countries" :transform="transform">
        <dm-country
          v-for="country in countries"
          :key="country.properties.NAME"
          :data="country"
          :d="topo(world, country)"
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
  data () {
    return {
      width: 800,
      height: 600,
      panning: false,
      zooming: false,
      source: '/topos/110m.json',
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
          this.countries = res.body.objects.countries.geometries
        }, err => {
          console.error(err)
        })
    },
    topo (world, country) {
      return this.geoPath(mesh(world, country))
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
