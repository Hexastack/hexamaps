// Tanspile an HexaMaps' plugin into semi functional object that can be used by the lib.
const defaults = {
  // basics
  string: '',
  number: 0,
  boolean: false,
  array: [],
  object: {},
  // advanced
  color: '#000',
  date: new Date(),
  // comlex
  coordinate: [0, 0]
}

const getDefaults = (dataDefinition) => {
  const data = {}
  for (let key in dataDefinition) {
    if (dataDefinition[key].default) {
      data[key] = dataDefinition[key].default
    } else if (dataDefinition[key].type) {
      data[key] = defaults[dataDefinition[key].type]
    }
    if (data[key] === undefined) {
      data[key] = null
    }
  }
  return data
}

const generate = (addons) => {
  const editables = {}
  const plugins = {
    // To contain vue-mixins that will be used on the HmMap component
    mapMixin: [],
    // To contain Components that are to be rendered directly within the HmMap component
    mapComponents: [],
    // To contain vue-mixins that will be used on the HmEntity component
    entityMixin: [],
    // To contain Components that are to be rendered directly within the HmEntity component
    entityComponents: [],
    // Creates a ready to use vue-plugin that implement onClick and onHover listners from the addons
    // If more than a plugin provides these listner, they will be all executed, in the plugin's set/import order
    entry: {
      install (Vue, options) {
        if (!options || !options.editor) {
          Vue.prototype.entityOnClick = (e, entity) => {
            let changes = entity.expose.wrap()
            addons.filter(plugin => !!plugin.entity.on.click).forEach(plugin => {
              changes = plugin.entity.on.click(
                e,
                changes,
                {inputs: entity[plugin.name + 'EntityIn'], outputs: entity[plugin.name + 'EntityOut'], data: entity[plugin.name + 'Entity']},
                {inputs: entity[plugin.name + 'In'], outputs: entity[plugin.name + 'Out'], data: entity[plugin.name]},
                entity.map.data
              )
            })
            return changes
          },
          Vue.prototype.entityOnHover = (e, entity) => {
            let changes = entity.expose.wrap()
            addons.filter(plugin => !!plugin.entity.on.hover).forEach(plugin => {
              changes = plugin.entity.on.hover(
                e,
                changes,
                {inputs: entity[plugin.name + 'EntityIn'], outputs: entity[plugin.name + 'EntityOut'], data: entity[plugin.name + 'Entity']},
                {inputs: entity[plugin.name + 'In'], outputs: entity[plugin.name + 'Out'], data: entity[plugin.name]},
                entity.map.data
              )
            })
            return changes
          }
        }
        Vue.prototype.mapOnData = (map) => {
          addons.filter(plugin => !!plugin.map.on.dataChanged).forEach(plugin => {
            plugin.map.on.dataChanged(map, {inputs: map[plugin.name + 'In'], outputs: map[plugin.name + 'Out'], data: map[plugin.name]}, map.map.data)
          })
        }
        Vue.prototype.mapOnSource = (map) => {
          addons.filter(plugin => !!plugin.map.on.sourceChanged).forEach(plugin => {
            plugin.map.on.sourceChanged(map, {inputs: map[plugin.name + 'In'], outputs: map[plugin.name + 'Out'], data: map[plugin.name]}, map.map.data)
          })
        }
        Vue.prototype.mapOnProjection = (map) => {
          addons.filter(plugin => !!plugin.map.on.projectionChanged).forEach(plugin => {
            plugin.map.on.projectionChanged(map, {inputs: map[plugin.name + 'In'], outputs: map[plugin.name + 'Out'], data: map[plugin.name]}, map.map.data)
          })
        }
      }
    }
  }

  addons.forEach(plugin => {
    const mapInputs = getDefaults(plugin.map.inputs)
    const mapOutputs = getDefaults(plugin.map.outputs)
    const mapInternals = getDefaults(plugin.map.data)
    const entityInputs = getDefaults(plugin.entity.inputs)
    const entityOutputs = getDefaults(plugin.entity.outputs)
    const entityInternals = getDefaults(plugin.entity.data)
    editables[plugin.name] = {
      map: {values: mapInputs, definition: plugin.map.inputs},
      entity: {values: entityInputs, definition: plugin.entity.inputs}
    }
    
    plugin.entity.components.pluginName = plugin.name
    plugins.entityComponents = plugins.entityComponents.concat(plugin.entity.components)
    plugin.map.components.pluginName = plugin.name
    plugins.mapComponents = plugins.mapComponents.concat(plugin.map.components)

    // Creates an isolated data and an updated hook mixin
    // For HmEntity
    plugins.entityMixin.push({
      data () {
        const data = {}
        data[plugin.name + 'Entity'] = Object.assign({}, entityInternals)
        data[plugin.name + 'EntityIn'] = Object.assign({}, entityInputs)
        data[plugin.name + 'EntityOut'] = Object.assign({}, entityOutputs)
        return data
      },
      created () {
        if (plugin.entity.lifeCycle.created)
          plugin.entity.lifeCycle.created(
            this,
            {inputs: this[plugin.name + 'EntityIn'], outputs: this[plugin.name + 'EntityOut'], data: this[plugin.name + 'Entity']},
            {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]},
            this.map.data
          )
      },
      updated () {
        if (plugin.entity.lifeCycle.updated)
          plugin.entity.lifeCycle.updated(
            this,
            {inputs: this[plugin.name + 'EntityIn'], outputs: this[plugin.name + 'EntityOut'], data: this[plugin.name + 'Entity']},
            {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]},
            this.map.data
          )
      },
      beforeDestroy () {
        if (plugin.entity.lifeCycle.beforeDestroy)
          plugin.entity.lifeCycle.beforeDestroy(
            this,
            {inputs: this[plugin.name + 'EntityIn'], outputs: this[plugin.name + 'EntityOut'], data: this[plugin.name + 'Entity']},
            {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]},
            this.map.data
          )
      }
    })
    // And HmMap
    const mapMixin = {
      data () {
        const data = {}
        data[plugin.name] = mapInternals
        data[plugin.name + 'In'] = mapInputs
        data[plugin.name + 'Out'] = mapOutputs
        return data
      },
      created () {
        if (plugin.map.created)
          plugin.map.created(this, {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]}, this.map.data)
      },
      updated () {
        if (plugin.map.updated)
          plugin.map.updated(this, {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]}, this.map.data)
      },
      beforeDestroy () {
        if (plugin.map.beforeDestroy)
          plugin.map.beforeDestroy(this, {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]}, this.map.data)
      },
      // We create an empty watch mixin to be filled with handlers
      watch: {}
    }
    // These handlers updates HmEntities, this is needed for the plugin's changes only
    mapMixin.watch[plugin.name + 'In'] = {
      handler: function() {
        if (plugin.map.on.inputChanged)
          plugin.map.on.inputChanged(
            this,
            {inputs: this[plugin.name + 'In'], outputs: this[plugin.name + 'Out'], data: this[plugin.name]},
            this.map.data
          )
        this.$children.forEach(child => child.$forceUpdate())
      },
      deep: true
    }
    plugins.mapMixin.push(mapMixin)
  })
  return {plugins, editables}
}

export default generate
