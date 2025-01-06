"use strict"
const { createQueue } = require("./queue")
const { EventEmitter } = require("node:events")

class Concurrency extends EventEmitter {
  /**
   * Create multiple queues,
   * and make concurency by
   * round robing algorithm.
   * @param {number} concurency - how many channels to create
   * @param {Function} executer - item executer
   * @param {number} timeout - execution timeout in ms. Default: 100
   */
  constructor(concurrency, executer, timeout) {
    super()
    this.queueIndex = 0
    this.qs = []
    this._fill(concurrency, executer, timeout)
  }

  /**
   * Add item to cuncurrency,
   * by round robing algorithm
   * @param {*} item
   */
  add(item) {
    const queue = this.qs[this.queueIndex++]
    queue.add(item)
    if (this.queueIndex === this.qs.length) this.queueIndex = 0
    return this
  }

  /**
   * Gett queues in concurrency
   */
  get queues() {
    return this.qs
  }

  /**
   * Inner methor to generate queues
   * @param {number} concurency - how many channels to create
   * @param {Function} executer - item executer
   * @param {number} timeout - execution timeout in ms. Default: 100
   */
  _fill(concurrency, executer, timeout) {
    for (let i = 0; i < concurrency; i++) {
      const queue = createQueue(executer, timeout)
      queue.on("error", error => this.emit("error", { queue: i, error }))
      queue.on("drain", () => this.emit("drain", { queue: i }))
      this.qs.push(queue)
    }
  }
}

/**
 * Create multiple queues,
 * and make concurency by
 * round robing algorithm.
 * @param {number} concurency - how many channels to create
 * @param {Function} executer - item executer
 * @param {number} timeout - execution timeout in ms. Default: 100
 */
const createConcurrency = (concurency, executer, timeout) => new Concurrency(concurency, executer, timeout)

module.exports = { createConcurrency }
