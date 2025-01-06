"use strict"
const { WatcherReserves } = require("./watcher-reserves")
const ETH_USD_PriceFeedABI = require("../../../artifacts/oracle/ETH-USD-PriceFeedABI")
const { ETH_USD_ORACLE } = require("../../../constants")
const { Contract } = require("ethers")

class WatcherReservesMakerDao extends WatcherReserves {
  constructor(config) {
    /**
     * @param {*} config - all configs settings from Main.json
     */
    super(config)
    this.config = config
  }
  /**
   * Redefine getReserves method
   */
  async getReserves() {
    const contract = this.getContract()
    const price = await contract.latestAnswer()
    return { eth: { price, decimals: 8 } }
  }

  /**
   * Abstract method
   */
  getContract() {
    const { provider } = this
    return new Contract(ETH_USD_ORACLE, ETH_USD_PriceFeedABI, provider)
  }
}

module.exports = { WatcherReservesMakerDao }
