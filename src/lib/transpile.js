const plugins = []

const definition = {
  mapMixin: [],
  mapComponents: [],
  entityMixin: [],
  entityComponents: [],
  entry: {
    install (Vue) {
      Vue.prototype.entityOnClick = (e, entity) => {
        let changes = entity.expose.wrap()
        plugins.filter(P => !!P.entityOnClick).forEach(plugin => {
          changes = plugin.entityOnClick(e, changes, entity[plugin.name], entity.map.data)
        })
        return changes
      },
      Vue.prototype.entityOnHover = (e, entity) => {
        let changes = entity.expose.wrap()
        plugins.filter(P => !!P.entityOnHover).forEach(plugin => {
          changes = plugin.entityOnHover(e, changes, entity[plugin.name], entity.map.data)
        })
        return changes
      }
    }
  }
}
const generate = () => {
  plugins.forEach(plugin => {
    plugin.entityComponents.pluginName = plugin.name
    definition.entityComponents = definition.entityComponents.concat(plugin.entityComponents)
    plugin.mapComponents.pluginName = plugin.name
    definition.mapComponents = definition.mapComponents.concat(plugin.mapComponents)

    definition.entityMixin.push({
      data () {
        const data = {}
        data[plugin.name + 'Entity'] = Object.assign({}, plugin.entityData)
        return data
      },
      updated () {
        plugin.entity(this, this[plugin.name + 'Entity'], this[plugin.name], (this.map && this.map.data) ? this.map.data : [])
      }
    })
    const mapMixin = {
      data () {
        const data = {}
        data[plugin.name] = plugin.mapData
        return data
      },
      updated () {
        plugin.map(this, this[plugin.name], (this.map && this.map.data) ? this.map.data : [])
        if (this.$children.length) {
          this.$children.forEach(child => child.$forceUpdate())
        }
      },
      watch: {}
    }
    mapMixin.watch[plugin.name] = {handler: function() {this.$children.forEach(child => child.$forceUpdate())}, deep: true}
    definition.mapMixin.push(mapMixin)
  })
  return definition
}


export default generate
