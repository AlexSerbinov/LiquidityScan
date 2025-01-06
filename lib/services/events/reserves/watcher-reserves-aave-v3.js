"use strict"
const { WatcherReserves } = require("./watcher-reserves")
const { createHelperV3 } = require("../../../helpers/onchain-aggregator")

class WatcherReservesV3 extends WatcherReserves {
  /**
   * @param {*} config - all configs settings from Main.json
   */
  constructor(config) {
    super(config)
    this.config = config
  }
  /**
   * Get aave helper contract
   * @returns {HelperV3}
   */
  getContract() {
    const provider = this.getProvider()
    return createHelperV3(provider, this.config)
  }
}

module.exports = { WatcherReservesV3 }
