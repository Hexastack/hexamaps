import Expose from '../lib/warpExpose'
export default function(mixins = [], children, pluginProps) {
  // Static props
  const props = {
    // path
    d: {
      type: String,
      default: ''
    },
    // data proper to entity, provided from the shapefiles
    data: {
      type: Object,
      default () {return {}}
    },
    // Admin level A0 A1 A2... -1 is for non administrative entities e.g: lakes
    adminLevel: {
      type: Number,
      default: 0
    },
    // an entity can be any bordered geographic entity like a lake
    type: {
      type: String,
      default: 'Administrative division'
    },
    centroid: {
      type: Array,
      default () { return [0, 0] }
    },
    bounds: {
      type: Array,
      default () { return [[0, 0], [200, 200]]}
    },
    area: {
      type: Number,
      default: 0
    },
    measure: {
      type: Number,
      default: 0
    },
    strokeWidth: {
      type: Number,
      default: 1
    }
  }
  // plugin props
  for (let pp in pluginProps) {
    props[pp] = pluginProps[pp]
  }
  return {
    name: 'HmEntity',
    mixins,
    render: function (createElement) {
      return createElement ('g', {class: 'hm-entity-box', attrs: {transform: this.transform}}, [
        createElement('path', {
          class: 'hm-entity',
          on:{click: this.click, mouseenter: this.hover},
          attrs: {d: this.d, fill: this.land, stroke: this.border, 'stroke-width': this.strokeWidth}}
        ),
        children.map(child => {
          const entityComponents = child(this, this[child.pluginName + 'Entity'], this[child.pluginName], this.map.data)
          return entityComponents.map(entityComponent => createElement(entityComponent.component, {props: entityComponent.props}))
        })
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
    props,
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
    created () {
      // expose this component's data so they can be changed from outside
      // attr in the second argument are readonly data
      this.expose = new Expose({
        land: this.land,
        border: this.border,
        scale: this.scale,
        x: this.x,
        y: this.y,
        angle: this.angle
      }, {
        data: this.data,
        category: this.category,
        type: this.type,
        centroid: this.centroid
      }, this)
    },
    methods: {
      // onClick & onMouseMove can be implemented from other element
      // allowing usage of this component data
      // (we are not using prototype.bind because we are also protecting some readonly data from change), but we can rethink it.
      click (e) {
        if (this.entityOnClick && !e.ctrlKey)
          this.expose.unwrap(this.entityOnClick(e, this))
      },
      hover (e) {
        if (this.entityOnHover && !e.ctrlKey)
          this.expose.unwrap(this.entityOnHover(e, this))
      }
    },
    computed: {
      transform () {
        return `translate(${this.x}, ${this.y}) scale(${this.scale}) rotate(${this.angle})`
      }
    }
  }
}
