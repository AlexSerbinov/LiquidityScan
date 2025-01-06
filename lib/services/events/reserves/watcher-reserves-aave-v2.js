"use strict"
const { WatcherReserves } = require("./watcher-reserves")
const { createHelperV2 } = require("../../../helpers/onchain-aggregator")

class WatcherReservesV2 extends WatcherReserves {
  /**
   * @param {*} config - all configs settings from Main.json
   */
  constructor(config) {
    super(config)
    this.config = config
  }
  /**
   * Get aave helper contract
   * @returns {HelperV2}
   */
  getContract() {
    const provider = this.getProvider()
    return createHelperV2(provider, this.config)
  }
}

module.exports = { WatcherReservesV2 }
