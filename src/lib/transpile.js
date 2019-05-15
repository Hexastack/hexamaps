// Tanspile an HexaMaps' plugin into semi functional object that can be used by the lib.
const generate = (plugins) => {
  const definition = {
    // To contain vue-mixins that will be used on the HmMap component
    mapMixin: [],
    // To contain Components that are to be rendered directly within the HmMap component
    mapComponents: [],
    // To contain vue-mixins that will be used on the HmEntity component
    entityMixin: [],
    // To contain Components that are to be rendered directly within the HmEntity component
    entityComponents: [],
    // Creates a ready to use vue-plugin that implement onClick and onHover listners from the plugins
    // If more than a plugin provides these listner, they will be all executed, in the plugin's set/import order
    entry: {
      install (Vue) {
        Vue.prototype.entityOnClick = (e, entity) => {
          let changes = entity.expose.wrap()
          plugins.filter(P => !!P.entityOnClick).forEach(plugin => {
            changes = plugin.entityOnClick(e, changes, entity[plugin.name + 'Entity'], entity[plugin.name], entity.map.data)
          })
          return changes
        },
        Vue.prototype.entityOnHover = (e, entity) => {
          let changes = entity.expose.wrap()
          plugins.filter(P => !!P.entityOnHover).forEach(plugin => {
            changes = plugin.entityOnHover(e, changes, entity[plugin.name + 'Entity'], entity[plugin.name], entity.map.data)
          })
          return changes
        }
      }
    }
  }

  plugins.forEach(plugin => {
    plugin.entityComponents.pluginName = plugin.name
    definition.entityComponents = definition.entityComponents.concat(plugin.entityComponents)
    plugin.mapComponents.pluginName = plugin.name
    definition.mapComponents = definition.mapComponents.concat(plugin.mapComponents)

    // Creates an isolated data and an updated hook mixin
    // For HmEntity
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
    // And HmMap
    const mapMixin = {
      data () {
        const data = {}
        data[plugin.name] = plugin.mapData
        return data
      },
      updated () {
        plugin.map(this, this[plugin.name], (this.map && this.map.data) ? this.map.data : [])
        // We need to force updates to run the update hook of HmEntities
        if (this.$children.length) {
          this.$children.forEach(child => child.$forceUpdate())
        }
      },
      // We create an empty watch mixin to be filled with handlers
      watch: {}
    }
    // These handlers updates HmEntities, this is needed for the plugin's changes only
    mapMixin.watch[plugin.name] = {handler: function() {this.$children.forEach(child => child.$forceUpdate())}, deep: true}
    definition.mapMixin.push(mapMixin)
  })
  return definition
}

export default generate
