<template>
  <g class="dm-country-box" :transform="transform">
    <path
      class="dm-country"
      @click="click"
      @mouseover="hover"
      :d="d"
      :fill="fill"
      :stroke="stroke"
    />
  </g>
</template>

<script>
import Expose from '../lib/warpExpose'
export default {
  name: 'DmCountry',
  props: {
    // Static props
    d: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default () {return {}}
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
    // Renderer
    countryDrawLand: {
      type: Function,
      default: function (country) { return this.land }
    },
    countryDrawBorder: {
      type: Function,
      default: function (country) { return this.border }
    }
  },
  data () {
    return {
      land: '#000000',
      border: '#aaaaaa',
      scale: 1,
      x: 0,
      y: 0,
      angle: 0
    }
  },
  created () {
    this.expose = new Expose({
      data: this.data,
      land: this.land,
      border: this.border,
      scale: this.scale,
      x: this.x,
      y: this.y,
      angle: this.angle
    }, this)
    this.mount()
  },
  methods: {
    click (e) {
      this.expose.unwrap(this.countryOnClick(e, this.expose.wrap()))
    },
    hover (e) {
      this.expose.unwrap(this.countryOnHover(e, this.expose.wrap()))
    },
    mount () {
      this.expose.unwrap(this.countryOnMount(this.expose.wrap()))
    }
  },
  computed: {
    transform () {
      return `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.angle})`
    },
    fill () {
     return this.countryDrawLand(this.expose.wrap())
    },
    stroke () {
      return this.countryDrawBorder(this.expose.wrap())
    }
  }
}
</script>

<style>

</style>
