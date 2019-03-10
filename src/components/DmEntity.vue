<template>
  <g class="dm-entity-box" :transform="transform">
    <path
      class="dm-entity"
      @click="click"
      @mouseover="hover"
      :d="d"
      :fill="land"
      :stroke="border"
    />
    <slot/>
  </g>
</template>

<script>
import Expose from '../lib/warpExpose'
export default {
  name: 'DmEntity',
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
    // Static props
    d: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default () {return {}}
    },
    category: {
      type: String,
      default: 'entity'
    },
    type: {
      type: String,
      default: 'A2'
    },
    centroid: {
      type: Array,
      default () { return [0, 0] }
    },
    // events
    entityOnClick: {
      type: Function,
      default (e, entity) { }
    },
    entityOnHover: {
      type: Function,
      default (e, entity) { }
    }
  },
  data () {
    return {
      land: '#000',
      border: '#666',
      scale: 1,
      x: 0,
      y: 0,
      angle: 0
    }
  },
  methods: {
    click (e) {
      // this.center.color = '#cc00dd'
      console.log(this)
    },
    hover (e) {
      
    }
  },
  computed: {
    transform () {
      return `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.angle})`
    }
  }
}
</script>

<style>

</style>
