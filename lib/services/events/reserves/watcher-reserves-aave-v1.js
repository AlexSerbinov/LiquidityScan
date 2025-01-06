"use strict"
const { WatcherReserves } = require("./watcher-reserves")
const { createHelperV1 } = require("../../../helpers/onchain-aggregator")

class WatcherReservesV1 extends WatcherReserves {
  /**
   * @param {*} config - all configs settings from Main.json
   */
  constructor(config) {
    super(config)
    this.config = config
  }
  /**
   * Get aave helper contract
   * @returns {HelperV1}
   */
  getContract() {
    const provider = this.getProvider()
    return createHelperV1(provider, this.config)
  }
}

module.exports = { WatcherReservesV1 }
