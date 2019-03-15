import Expose from '../lib/warpExpose'
export default function(mixins = [], children) {
  return {
    name: 'DmEntity',
    mixins,
    render: function (createElement) {
      return createElement ('g', {class: 'dm-entity-box', attrs: {transform: this.transform}, slot: 'entity'}, [
        createElement('path', {
          class: 'dm-entity',
          on:{click: this.click, hover: this.hover},
          attrs: {d: this.d, fill: this.land, stroke: this.border}}
        ),
        children.map(child => {
          const ecs = child(this, this[child.pluginName], this.map.data)
          return ecs.map(ec => createElement(ec.component, {props: ec.props}))
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
    created () {
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
      click (e) {
        if (this.entityOnClick)
          this.expose.unwrap(this.entityOnClick(e, this))
      },
      hover (e) {
        if (this.entityOnHover)
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
