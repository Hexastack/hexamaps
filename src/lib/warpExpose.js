const Expose = function (binds, component) {
  this.binds = binds
  this.component = component
}
Object.assign(Expose.prototype, {
  wrap: function () {
    let wraped = {}
    for (let item in this.component) {
      if (item in this.binds && item !== constructor) {
        wraped[item] = this.component[item]
      }
    }
    return wraped
  },
  unwrap: function(results) {
    for (let item in results) {
      if (item in this.binds) {
        this.component[item] = results[item]
      }
    }
  }
})

export default Expose
