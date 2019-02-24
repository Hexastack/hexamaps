<template>
  <g class="dm-entity-box" :transform="transform">
    <path
      class="dm-entity"
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
  name: 'DmEntity',
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
    entityOnClick: {
      type: Function,
      default: function (e, entity) { }
    },
    entityOnHover: {
      type: Function,
      default: function (e, entity) { }
    },
    entityOnMount: {
      type: Function,
      default: function (entity) { }
    },
    // Renderer
    entityDrawLand: {
      type: Function,
      default: function (entity) { return this.land }
    },
    entityDrawBorder: {
      type: Function,
      default: function (entity) { return this.border }
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
      this.expose.unwrap(this.entityOnClick(e, this.expose.wrap()))
    },
    hover (e) {
      this.expose.unwrap(this.entityOnHover(e, this.expose.wrap()))
    },
    mount () {
      this.expose.unwrap(this.entityOnMount(this.expose.wrap()))
    }
  },
  computed: {
    transform () {
      return `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.angle})`
    },
    fill () {
     return this.entityDrawLand(this.expose.wrap())
    },
    stroke () {
      return this.entityDrawBorder(this.expose.wrap())
    }
  }
}
</script>

<style>

</style>
