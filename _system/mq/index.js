"use strict"
const mq = require("./mq")
const { getConfig } = require("../config")

/**
 * Single MQ getter
 * @returns
 */
const getMQ = async host => {
  if (mq.isReady()) return mq
  await mq.prepare(host)
  return mq
}

/**
 * Subscribe for given channel
 * @param {string} topic - topic name
 * @param {Function} listener - callback
 */
const subscribe = async (topic, listener) => {
  const config = getConfig()
  const mq = await getMQ(config.mq.host)
  mq.subscribe(topic, listener)
}

/**
 * Publish for given channel
 * @param {string} topic - topic name
 * @param {*} message - message as object
 */
const notify = async (topic, message) => {
  const config = getConfig()
  const mq = await getMQ(config.mq.host)
  mq.notify(topic, message)
}

/**
 * Send system event
 * @param {*} message
 */
const sendEvent = async (service, event, data) => {
  const config = getConfig()
  notify(config.mq.topics.stats, { service, event, data })
}

/**
 * Listen system commands
 * @param {string} service - service name
 * @param {*} listener - callback
 */
const onCommand = async (service, listener) => {
  const config = getConfig()
  const topic = `${config.mq.topics.command}/${service}`
  subscribe(topic, listener)
}

module.exports = { getMQ, subscribe, notify, sendEvent, onCommand }
