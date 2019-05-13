// This module provides a way to expose a component's data
// If any of this data is not read-only, it can be changed if the exposed object is returned

/**
 * @constructor
 * @param {Object} binds - Data to bind, they can be changed
 * @param {Object} readOnly - Data exposed on read only mode
 * @param {Component} component - The component owner of the data
 */
const Expose = function (binds, readOnly, component) {
  this.binds = binds
  this.readOnly = readOnly
  this.component = component
}
Object.assign(Expose.prototype, {
  /**
   * @method wrap - Exposes component's data
   * @returns {Object} - An Object containing the exposed data
   */
  wrap: function () {
    let wraped = {}
    for (let item in this.component) {
      if ((item in this.binds || item in this.readOnly) && item !== constructor) {
        wraped[item] = this.component[item]
      }
    }
    return wraped
  },
  /**
   * @method unwrap
   * @param {Object} results - The previously exposed object with it's changes
   */
  unwrap: function(results) {
    for (let item in results) {
      if (item in this.binds) {
        this.component[item] = results[item]
      }
    }
  }
})

export default Expose
