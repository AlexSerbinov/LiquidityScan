const { TransmitFetcherAave } = require("./fetcher-aave")
const { getHelper } = require("../../../helpers/onchain-aggregator")
const { PROTOCOLS_CONFIG } = require("../../../constants")

class TransmitV3 extends TransmitFetcherAave {
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
    return getHelper("V3", provider, this.config)
  }

  getProtocol() {
    return "V3"
  }

  getLendingPool() {
    return PROTOCOLS_CONFIG.V3.POOL
  }

  getABIDecode() {
    return ["uint256 totalCollateralBase", "uint256 totalDebtBase", "uint256 availableBorrowsBase", "uint256 currentLiquidationThreshold", "uint256 ltv", "uint256 healthFactor"]
  }

  getDataPrefix() {
    return "0xbf92857c000000000000000000000000"
  }
}
module.exports = { TransmitV3 }
