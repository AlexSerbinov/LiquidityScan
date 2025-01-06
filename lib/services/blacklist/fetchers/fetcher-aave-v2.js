const { Fetcher } = require("./fetcher")
const { Contract } = require("ethers")

/* Helper contract */
const { getHelper } = require("../../../helpers/onchain-aggregator")

/* Pool contract */
const V2LendingPoolABI = require("../../../artifacts/v2/LendingPoolABI")
const { PROTOCOLS_CONFIG } = require("../../../constants")

/**
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} simulator - enso simulator instance
 */
class FetcherV2 extends Fetcher {
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
    this.params = params
    this.simulator = simulator
    this.helperContract = getHelper(this.params.protocol, this.provider, this.config)
    this.contract = new Contract(PROTOCOLS_CONFIG.V2.POOL, V2LendingPoolABI, this.provider)
  }

  async getUserDataFromNode(address, blockTag) {
    const userData = await this.contract.getUserAccountData(address, {
      blockTag,
    })

    return {
      healthFactor: userData.healthFactor,
      totalCollateralETH: userData.totalCollateralETH,
      totalBorrowsETH: userData.totalDebtETH,
    }
  }
}

module.exports = { FetcherV2 }
