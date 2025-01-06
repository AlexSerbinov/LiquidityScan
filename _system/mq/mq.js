"use strict"
const { connect } = require("mqtt")
const assert = require("node:assert/strict")

/**
 * mqtt instance
 */
let mqtt

/**
 * Connection state
 */
let connected = false

/**
 * listeners we already subscribed
 */
const listeners = new Map()

/**
 * Check is client ready
 * @returns {boolean} - true if ready
 */
const isReady = () => {
  return connected
}

/**
 * Count channels we subscribed for
 * @returns {number} - channels count
 */
const countChannels = () => {
  return listeners.size
}

/**
 * Count listeners for given channel
 * @param {string} channel - channel name
 * @returns {number} - listeners count
 */
const countListeners = channel => {
  if (!listeners.has(channel)) return 0
  const ls = listeners.get(channel)
  return ls.length
}

/**
 * Convert Buffer to object
 * @param {Buffer} buff - message from mqtt broker
 * @returns {Object}
 */
const parse = buff => {
  try {
    const str = buff.toString("utf8")
    return JSON.parse(str)
  } catch {
    return
  }
}

/**
 * Listen mqtt messages here
 * @param {string} channel - channel message comes from
 * @param {Buffer} message - message from mqtt broker
 * @returns {void}
 */
const onMessage = (channel, message) => {
  setImmediate(() => {
    if (!listeners.has(channel)) return
    const obj = parse(message)
    if (!obj) return
    const callbacks = listeners.get(channel)
    for (const callback of callbacks) callback(obj)
  })
}

/**
 * Prepare mqtt
 * @param {string} url - mqtt broker URL
 * @param {object} options - connection options
 * https://github.com/mqttjs/MQTT.js#mqttconnecturl-options
 */
const prepare = (url, options) => {
  const fn = resolve => {
    mqtt = connect(url, options)
    mqtt.on("message", onMessage)
    mqtt.on("connect", () => {
      connected = true
      resolve()
    })
  }

  return new Promise(fn)
}

/**
 * Subscribe ot mqtt events
 * @param {string} channel - channel name
 * @param {function} callback - listener
 */
const subscribe = (channel, callback) => {
  assert(connected, "Client is not connected.")
  let callbacks = []
  if (listeners.has(channel)) callbacks = listeners.get(channel)
  else
    mqtt.subscribe(channel, err => {
      if (err) throw err
    })

  callbacks.push(callback)
  listeners.set(channel, callbacks)
}

/**
 * Remove all listeners for channel,
 * and unsubscribe mqtt from channel
 * @param {string} channel
 * @returns {void}
 */
const unsubscribe = channel => {
  assert(connected, "Client is not connected.")
  if (!listeners.has(channel)) return
  listeners.delete(channel)
  mqtt.unsubscribe(channel, err => {
    if (err) throw err
  })
}

/**
 * Publish message
 * @param {string} channel - chennale name
 * @param {Object} data - some obj
 */
const notify = (channel, data) => {
  assert(connected, "Client is not connected.")
  assert(typeof data === "object", "Data should be an object.")
  const str = JSON.stringify(data)
  mqtt.publish(channel, str)
}

/**
 * End connection
 * @returns {Promise} will resolve when connection will close
 */
const end = () => {
  const fn = resolve => {
    connected = false
    listeners.clear()
    mqtt.end(true, {}, resolve)
  }

  return new Promise(fn)
}

module.exports = { prepare, subscribe, unsubscribe, notify, end, countChannels, countListeners, isReady }
