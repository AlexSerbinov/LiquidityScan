"use strict"
const { EventEmitter } = require("node:events")
const { getProvider } = require("../../../ethers/pool")

/**
 * Abstract Reserves watcher
 */
class WatcherReserves {
  /**
   * @param {*} config - all configs settings from Main.json
   */
  constructor(config) {
    this.events = new EventEmitter()
    this.started = false
    const provider = getProvider()
    provider.on("error", e => {
      this.resetProvider()
      this.events.emit("error", e)
    })
    this.provider = provider
  }

  /**
   * Get current RPC provider
   * @returns {Provider} - provider from @npm/ethers
   */
  getProvider() {
    return this.provider
  }

  /**
   * Release current and get new provider
   */
  resetProvider() {
    this.provider = getProvider()
  }

  /**
   * Start watching
   * @param {number} interval - int in ms
   * @returns {WatcherReserves}
   */
  start(trigger) {
    if (this.started) return this
    this.started = true
    trigger.on("update", async () => {
      if (!this.started) return
      const reserves = await this.getReserves().catch(e => this.events.emit("error", e))
      this.events.emit("reserves", reserves)
    })
    return this
  }

  /**
   * Stop watching
   * @returns {WatcherReserves}
   */
  stop() {
    this.started = false
    return this
  }

  /**
   * Listen events
   * @returns {WatcherReserves}
   */
  onReserves(listener) {
    const { events } = this
    events.on("reserves", listener)
    return this
  }

  /**
   * Listen error events
   * @returns {WatcherReserves}
   */
  onError(listener) {
    const { events } = this
    events.on("error", listener)
    return this
  }

  /**
   *
   */
  async getReserves() {
    const contract = this.getContract()
    return contract.getGlobalReserves()
  }

  /**
   * Abstract method
   */
  getContract() {
    throw new Error("Method not implemented.")
  }
}

module.exports = { WatcherReserves }
