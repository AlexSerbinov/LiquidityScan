const { TransmitFetcherAave } = require("./fetcher-aave")
const { getHelper } = require("../../../helpers/onchain-aggregator")
const { PROTOCOLS_CONFIG } = require("../../../constants")

class TransmitV2 extends TransmitFetcherAave {
  /**
   * @param {*} params -  object that contains all params from $.params
   * @param {*} filters - object that contains { minHF, maxHF }
   * @param {*} config - all configs from Main.json
   * @param {*} simulator - Simulator instance
   */
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
  }

  /**
   * Gett aave helper contract
   * @param {Provider} - rpc provider
   * @returns {Helper}
   */
  getContract(provider) {
    return getHelper("V2", provider, this.config)
  }

  getProtocol() {
    return "V2"
  }

  getLendingPool() {
    return PROTOCOLS_CONFIG.V2.POOL
  }

  getABIDecode() {
    return ["uint256 totalCollateralETH", "uint256 totalDebtETH", "uint256 availableBorrowsETH", "uint256 currentLiquidationThreshold", "uint256 ltv", "uint256 healthFactor"]
  }

  getDataPrefix() {
    return "0xbf92857c000000000000000000000000"
  }
}
module.exports = { TransmitV2 }
