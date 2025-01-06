"use strict"
const { WatcherReserves } = require("./watcher-reserves")
const ETH_USD_PriceFeedABI = require("../../../artifacts/oracle/ETH-USD-PriceFeedABI")
const { ETH_USD_ORACLE } = require("../../../constants")
const { Contract } = require("ethers")

class WatcherReservesLiquity extends WatcherReserves {
  constructor(config) {
    super(config)
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

module.exports = { WatcherReservesLiquity }
