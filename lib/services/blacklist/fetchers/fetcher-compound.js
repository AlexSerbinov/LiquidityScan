const { BigNumber } = require("ethers")
const { Fetcher } = require("./fetcher")

/* Helper contract */
const { getHelper } = require("../../../helpers/onchain-aggregator")

/**
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} simulator - enso simulator instance
 */
class FetcherCompound extends Fetcher {
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
    this.params = params
    this.simulator = simulator

    this.helperContract = getHelper(this.params.protocol, this.provider, config)
    this.contract = null
  }

  async getUserDataFromNode(address) {
    const { healthFactor, totalCollateralETH, totalBorrowsETH } = await this.helperContract.getUserReserves(address)

    return {
      healthFactor,
      totalCollateralETH,
      totalBorrowsETH,
    }
  }

  /**
   * Update global reserves through
   * this method
   * @param {*} data - global reserves
   * @returns {Fetcher}
   */
  setGlobalReservesData(data) {
    this.globalReservesData = data
    this.helperContract.setGlobalReserves(data)
    this.emit("fetcherReady", {})
    return this
  }
}

module.exports = { FetcherCompound }
