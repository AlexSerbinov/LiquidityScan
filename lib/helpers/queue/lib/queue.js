"use strict"
const { EventEmitter } = require("node:events")
/**
 * import events logger constants from loggerTopicsConstants
 */
const { ERROR_MESSAGE_IN_QUEUE } = require("../../../../configs/loggerTopicsConstants")

/**
 * Simple Queue
 */
class Queue extends EventEmitter {
  /**
   * @param {Function} executer - item executer
   * @param {number} execTimeout - /**
   * @param {number} execTimeout - Default 100. This is the time limit for each task's execution within the queue. If a task exceeds this duration, the queue will attempt to move on to the next task, preventing the system from being stalled by tasks that take too long to complete. Default value: 100 ms. Adjusting this value can help manage the balance between responsiveness and allowing adequate time for task completion.
   */
  constructor(executer, execTimeout) {
    super()
    this.executer = executer
    this.items = []
    this.running = false
    this.execTimeout = execTimeout || 100
  }

  /**
   * Current length of queue
   * @returns {number}
   */
  get length() {
    return this.items.length
  }

  /**
   * Add ittem to queu
   * @param {*} item - will go to executer
   * @returns {Queue}
   */
  add(item) {
    this.items.push(item)
    if (!this.running) this._execute()
    return this
  }

  /**
   * Recursive unblocking execution
   */
  _execute() {
    this.running = true
    setImmediate(async () => {
      // console.log(`items in queue ${this.items.length} ${new Date().toISOString()}`) //dev
      const item = this.items.shift()
      if (item === undefined) {
        this.running = false
        this.emit("drain", null)
        return
      }

      let broke = false
      const timeout = setTimeout(() => {
        broke = true
        console.error(`Queue execution timeout expired ${this.execTimeout}`)
        this.emit("errorMessage", `Queue execution timeout expired ${this.execTimeout}`, ERROR_MESSAGE_IN_QUEUE)

        this._execute() // Ensure that execution continues with the next item
      }, this.execTimeout) // Timeout to handle execution time exceeding the allowed limit

      try {
        await this.executer(item)
      } catch (e) {
        console.error("Queue error")
        console.error(e)
        this.emit("error", e)
        throw e
      }

      if (!broke) {
        clearTimeout(timeout)
        this._execute()
      }
    })
  }
}

/**
 * Default Queue factory
 * @param {Function} executer - item executer
 * @param {number} {execTimeout} timeout - execution timeout in ms. Default: 100
 * @returns {Queue}
 */
const createQueue = (executer, execTimeout) => new Queue(executer, execTimeout)

module.exports = { Queue, createQueue }
