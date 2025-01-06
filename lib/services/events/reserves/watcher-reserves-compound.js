"use strict"
const { WatcherReserves } = require("./watcher-reserves")
const { createHelperCompound } = require("../../../helpers/onchain-aggregator")

class WatcherReservesCompound extends WatcherReserves {
  /**
   * @param {*} config - all configs settings from Main.json
   */
  constructor(config) {
    super(config)
    this.config = config
  }
  /**
   * Get aave helper contract
   * @returns {HelperCompound}
   */
  getContract() {
    const provider = this.getProvider()
    return createHelperCompound(provider, this.config)
  }
}

module.exports = { WatcherReservesCompound }
