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
      const createEntities = (ce, children, mixins) => {
        let entities = []
        for (let entity in this.countries) {
          let DmEntity = Entity(mixins, children)
          entities.push(ce(DmEntity, {
            key: this.countries[entity].properties.id || this.countries[entity].properties.NAME || entity,
            props: {
              d: this.topo(this.world, this.countries[entity]),
              data: this.countries[entity].properties,
              centroid: this.centroid(this.world, this.countries[entity]),
              type: 'A' + this.countries[entity].properties.LEVEL
            }
          }))
            
        }
        return entities
      }
      return createElement ('div', {class: 'dm-map'}, [
        createElement('svg', {class: 'dm-svg', style: this.style}, [
          createElement('g', {class: 'dm-countries', attrs: {transform: this.transform}}, [
            this.withGraticule ? createElement('path', {class: 'dm-graticules', attrs: {stroke: '#ccc', fill: 'none', d: this.graticule()}}) : null,
            createEntities(createElement, plugin.entityComponents, plugin.entityMixin)
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
      projection () {
        const projection = projections[this.projection] ? projections[this.projection] : projections.geoMercator
        this.geoPath = geoPath().projection(projection())
      },
      'map.source' () {
        this.load()
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
}