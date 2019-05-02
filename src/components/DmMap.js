import Entity from './DmEntity'
import { geoPath, geoGraticule } from 'd3-geo'
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

export default function(plugin) {
  return {
    name: 'DmMap',
    mixins: plugin.mapMixin,
    render: function (createElement) {
      const propsArray = plugin.mapMixin.map(pm => pm.data())
      let pluginProps = {}
      for (let i = 0; i < propsArray.length; i++) {
        Object.assign(pluginProps, propsArray[i])
      }
      const createProps = (entity, pluginProps) => {
        let props = {
          d: this.topo(this.world, this.countries[entity]),
          data: this.countries[entity].properties,
          centroid: this.centroid(this.world, this.countries[entity]),
          type: 'A' + this.countries[entity].properties.LEVEL,
          strokeWidth: 1 / this.scale
        }
        for (let pp in pluginProps) {
          props[pp] = pluginProps[pp]
        }
        return props
      }
      const createEntities = (ce, children, mixins, pluginProps) => {
        let entities = []
        for (let entity in this.countries) {
          let DmEntity = Entity(mixins, children, pluginProps)
          entities.push(ce(DmEntity, {
            key: this.countries[entity].properties.id || this.countries[entity].properties.NAME || entity,
            props: createProps(entity, pluginProps)
          }))
        }
        return entities
      }
      return createElement ('div', {class: 'dm-map'}, [
        createElement('svg', {class: 'dm-svg', style: this.style, on: {wheel: this.zoom}}, [
          createElement('g', {class: 'dm-countries', attrs: {transform: this.transform}}, [
            this.withGraticule ? createElement('path', {class: 'dm-graticules', attrs: {stroke: '#ccc', fill: 'none', d: this.graticule()}}) : null,
            createEntities(createElement, plugin.entityComponents, plugin.entityMixin, pluginProps)
          ])
        ])
      ])
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
      projection () {
        const projection = projections[this.projection] ? projections[this.projection] : projections.geoMercator
        this.geoPath = geoPath().projection(projection())
      },
      'map.source' () {
        this.load()
      },
      'map.data' : { 
        handler () {
          this.$forceUpdate()
        },
        deep: true
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
      },
      zoom (e) {
        e.preventDefault()
        const zoom = -e.deltaY / 3
        const scale = 2 ** (Math.log2(this.scale) + zoom)
        if (scale < 0.125 || scale > 64) {
          return false
        }
        const coef = -.25 - e.deltaY * -.25
        const X = e.clientX - this.$el.offsetLeft + window.scrollX
        const Y = e.clientY - this.$el.offsetTop + window.scrollY
        // if (e.deltaY < 0) {
        this.x = 2 ** zoom * (this.x + coef * this.scale * X) + coef * ((1 - scale) * X)
        this.y = 2 ** zoom * (this.y +  coef * this.scale * Y) + coef * ((1 - scale) * Y)
        // } else {
        //   this.x = .5 * (this.x + this.scale / 2 * e.clientX) + .5 * ((1 - scale) * e.clientX)
        //   this.y = .5 * (this.y + this.scale / 2 * e.clientY) + .5 * ((1 - scale) * e.clientY)
        // }
        this.scale = scale
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
}
