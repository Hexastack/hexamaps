<template>
  <g class="dm-country-box" :transform="transform">
    <path
      class="dm-country"
      :d="d"
      :fill="land"
      :stroke="border"
    />
  </g>
</template>

<script>
export default {
  name: 'DmCountry',
  props: {
    d: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default () {return {}}
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
  computed: {
    transform () {
      return `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.angle})`
    }
  }
}
</script>

<style>

</style>
