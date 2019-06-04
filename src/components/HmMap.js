import Entity from './HmEntity'
import { geoPath, geoGraticule } from 'd3-geo'
import { feature } from 'topojson'
import projections from '../lib/projections'
import { geoStitch } from 'd3-geo-projection'

export default function(plugin) {
  // Entities are already compiled HmEntity component, we keep track of them and we recreate them only when needed
  let entities = []
  return {
    name: 'HmMap',
    mixins: plugin.mapMixin,
    render: function (createElement) {
      const propsArray = plugin.mapMixin.map(pm => pm.data())
      let pluginProps = {}
      for (let i = 0; i < propsArray.length; i++) {
        Object.assign(pluginProps, propsArray[i])
      }
      /**
       * @method createProps - creates vue-props for the HmEntities
       * @param {Object} entity - country key of the to be HmEntity
       * @param {Object} pluginProps - mapData of all plugins used
       * @returns {Object} - props of the entity, including mapData ones
       */
      const createProps = (entity, pluginProps) => {
        // prepare props to pass
        // first entity props
        let props = {
          geoPath: this.geoPath,
          feature: this.countries[entity].feature,
          hasc: this.countries[entity].properties.HASC,
          name: this.countries[entity].properties.NAME,
          data: this.countries[entity].properties, // May be removed as it exists within feature already
          adminLevel: this.countries[entity].properties.LEVEL,
          type: this.countries[entity].properties.TYPE,
          maxLevel: this.countries[entity].properties.MAXLEVEL,
          strokeWidth: 1 / this.zoom
        }
        // then addon props
        for (let pp in pluginProps) {
          props[pp] = pluginProps[pp]
        }
        return props
      }
      /**
       * @method createEntities - Create a HmEntity
       * @param {Function} createElement - Vue's createElement (often refered to as h)
       * @param {Component[]} entityComponents - child component of the HmEntity (entityComponents)
       * @param {Object} entityMixin - Entity mixins
       * @param {Object} pluginProps - Map mixins
       * @returns {Component} - HmEntity, a Compiled Vue component 
       */
      const createEntities = (createElement, entityComponents, entityMixin, pluginProps) => {
        if (this.countryChanged) {
          entities = []
        }
        let i = 0
        let newEntities = []
        for (let entity in this.countries) {
          if (this.countryChanged) {
            entities[i] = Entity(entityMixin, entityComponents, pluginProps)
          }
          newEntities.push(createElement(entities[i], {
            key: this.countries[entity].properties.ID,
            props: createProps(entity, pluginProps)
          }))
          i++
        }
        this.countryChanged = false
        return newEntities
      }
      return createElement ('div', {class: 'hm-map'}, [
        createElement('svg', {class: 'hm-svg', style: this.style, on: {
          wheel: this.wheel,
          mousedown: this.panStart,
          mousemove: this.pan,
          mouseup: this.panEnd
        }}, [
          createElement('g', {class: 'hm-countries', attrs: {transform: this.transform}},
            // MapComponents go first
            plugin.mapComponents.map(child => {
              const mapComponents = child(this, this[child.pluginName], this.map.data)
              return mapComponents.map(mapComponent => createElement(mapComponent.component, {props: mapComponent.props}))
            })
            .concat([
              // then any hexamaps map layer
              this.withGraticule ? createElement('path', {class: 'hm-graticules', attrs: {stroke: '#ccc', fill: 'none', d: this.graticule()}}) : null,
              // Finally the map
              createEntities(createElement, plugin.entityComponents, plugin.entityMixin, pluginProps)
              // Do we need to draw layers over the map? 
            ])
          )
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
      projectionName: {
        type: String,
        default: 'geoMercator'
      },
      withGraticule: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        // width and height proportions are arbitray and fits for mercator projections only
        width: 800,
        height: 600,
        // tracks if user is panning or not
        panning: false,
        // list of bordered entities
        countries: [],
        // will be replaced by a function that draws border according to the choosen projection
        geoPath: function () { return '' },
        // will be replaced by a projection function
        projection: function () { return '' }, // or projections.geoMercator(), ?
        // this is a planar zoom value, it works like zooming into a picture
        // it scales all the elements within the drawing area
        zoom: 1,
        // this is the projection zoom, it scale according to the projection
        // it scales the map only
        scale: 1,
        initialScale: 1,
        // coordinate of the drawing area
        x: 0,
        y: 0,
        // projection rotation/transition angles
        theta: 0,
        phi: 0,
        // planar angle, it rotate everything in the drawing area
        angle: 0,
        // tracks when countries are geographically changed
        countryChanged: true
        // Additionally data contain an attr world, not listed as we do not want it reactive
      }
    },
    mounted () {
      // resize the map to use all the available space
      this.resize()
      // add a resize listner
      window.addEventListener('resize', this.resize)
      // sets the projection
      this.projection = projections[this.projectionName] ? projections[this.projectionName]() : projections.geoMercator()
      // each projection comes with a scale (suitable scale for a 600/600 drawing area), we save it to use it a coeficient when scaling 
      this.initialScale = this.projection.scale()
      // we assign the pathing function to our geoPath
      this.geoPath = geoPath().projection(this.projection.rotate([this.theta, this.phi]).scale(this.scale * this.initialScale))
      // finally we load the map
      this.load()
    },
    watch: {
      // we re-assign the pathing function each time the projection change
      projectionName () {
        this.projection = projections[this.projectionName] ? projections[this.projectionName]() : projections.geoMercator()
        this.initialScale = this.projection.scale()
        this.geoPath = geoPath().projection(this.projection.rotate([this.theta, this.phi]).scale(this.scale * this.initialScale))
      },
      'map.source' () {
        this.load()
      },
      // we manully update this component each time the user's data change,
      // so any related to data changes propagates to its children
      'map.data' : {
        handler () {
          this.$forceUpdate()
        },
        deep: true
      },
      countries () {
        this.countryChanged = true
      }
    },
    methods: {
      resize () {
        this.width = this.$el.clientWidth
        this.height = this.$el.clientHeight - 4 // firefox always adds 4, if there is padding then this will glitch,
        // also other solutions are too demanding and not that stable for this problem
        // e.g: `parseInt(getComputedStyle(this.$el).height)` won't work when box-sizing is set to border box
        // and getComputedStyle does not work in IE and it blocks growing in responsive setting
        // best solution remain to get offsetHeight and substruct vertical paddings and borders
      },
      load () {
        fetch(this.map.source)
          .then(response => {
            return response.json()
          })
          .then(json => {
            this.world = json
            this.countries = json.objects
            // generate geojson to be passed to entity component
            for (let entity in this.countries) {
              this.countries[entity].feature = geoStitch(feature(this.world, this.countries[entity]))
            }
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.error(err)
          })
      },
      // Generates graticules for the given projection
      graticule () {
        return this.geoPath(geoGraticule()())
      },
      // panning is controlled by the data attr `panning` and the following three methods
      // this is prefered over adding and removing event listners for now
      panStart () {
        this.panning = !this.panning
      },
      pan (e) {
        if (this.panning) {
          if (e.ctrlKey) {
            // projection transition/rotation
            this.theta += e.movementX
            this.phi -= e.movementY
            this.projection.rotate([this.theta, this.phi])
            this.geoPath = geoPath().projection(this.projection)
          } else if (e.shiftKey) {
            // planar rotation
            this.angle += (e.movementX - e.movementY) / 2
          } else {
            // planar transition
            this.x += e.movementX
            this.y += e.movementY
          }
        }
      },
      panEnd () {
        this.panning = false
      },
      // the wheel zoom works fine :) these equations are messy af, for zoom on dbclick
      // is equivalent to event.deltaY = -3
      wheel (e) {
        if (e.ctrlKey || e.shiftKey) {
          e.preventDefault()
          const zoom = -e.deltaY / 3
          if (e.ctrlKey) {
            // planar zoom
            const scale = 2 ** (Math.log2(this.zoom) + zoom)
            if (scale < 0.125 || scale > 4096) {
              return false
            }
            const coef = -.25 - e.deltaY * -.25
            const X = e.clientX - this.$el.offsetLeft + window.scrollX
            const Y = e.clientY - this.$el.offsetTop + window.scrollY
            this.x = 2 ** zoom * (this.x + coef * this.zoom * X) + coef * ((1 - scale) * X)
            this.y = 2 ** zoom * (this.y + coef * this.zoom * Y) + coef * ((1 - scale) * Y)
            this.zoom = scale
          } else {
            // projection zoom
            const scale = 2 ** (Math.log2(this.scale) + zoom)
            if (scale < 0.125 || scale > 4096) {
              return false
            }
            const coef = -.25 - e.deltaY * -.25
            const X = e.clientX - this.$el.offsetLeft + window.scrollX - this.width / 2
            const Y = e.clientY - this.$el.offsetTop + window.scrollY - this.height / 2
            this.x = 2 ** zoom * (this.x + coef * this.scale * X) + coef * ((1 - scale) * X)
            this.y = 2 ** zoom * (this.y + coef * this.scale * Y) + coef * ((1 - scale) * Y)
            this.scale = scale
            this.projection.scale(this.scale * this.initialScale)
            this.geoPath = geoPath().projection(this.projection)
          }
        }
      }
    },
    computed: {
      style () {
        return { height: `${this.height}px`, width: `${this.width}px` }
      },
      // Ratios can be used to resize countries within the map, either by stretching em
      // or by rendering by the smallest ratio as default, they are omitted for now
      // wRatio () {
      //   return this.width / 800
      // },
      // hRatio () {
      //   return this.height / 600
      // },
      transform () {
        return `translate(${this.x}, ${this.y}) scale(${this.zoom}) rotate(${this.angle}, ${this.width / 2}, ${this.height/2})`
      }
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.resize)
    }
  }
}
