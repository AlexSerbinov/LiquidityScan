"use strict"
const { EventEmitter } = require("node:events")

/**
 * Send event
 */
const send = Symbol("send")

/**
 * Bridge to make communication bethwen
 * process and virtual machine
 */
class Bridge extends EventEmitter {
  /**
   * @param {string} name - service name
   * @param {*} params - services params
   */
  constructor(name, params) {
    super()
    this.name = name
    this.__notify = params.notify || {}
    this.params = params.params || {}
    this.forks = params.forks || {}
    this.finalize = () => {}
  }

  /**
   * Send message by mqtt
   * @param {string} type - message type
   * @param {*} message - message
   * @returns {Bridge}
   */
  send(type, message) {
    const { __notify } = this
    if (!__notify[type]) return this
    this.emit(send, { type, message })
    return this
  }

  /**
   * Send warn message
   * @param {*} message
   * @returns {Bridge}
   */
  warn(message) {
    const type = "warn"
    this.emit(send, { type, message })
    return this
  }

  /**
   * Send error from ,
   * this will restart process!
   * @param {*} message - error message
   * @returns {Bridge}
   */
  error(message) {
    const type = "error"
    this.emit(send, { type, message })
    return this
  }

  /**
   * Set before stop callback
   * @param {*} callback
   */
  onExit(callback) {
    this.finalize = callback
  }
}

const createBridge = (name, params) => new Bridge(name, params)

module.exports = { createBridge, Bridge, send }
