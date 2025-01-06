const { Fetcher } = require("./fetcher")
const { Contract } = require("ethers")
const { BigNumber } = require("bignumber.js")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { SIMULATION_SUCCESS, SIMULATION_ERROR } = require("../../../../configs/loggerTopicsConstants")

/* Helper contract */
const { getHelper } = require("../../../helpers/onchain-aggregator")

/* Pool contract */
const V3LendingPoolABI = require("../../../artifacts/v3/PoolABI")
const { PROTOCOLS_CONFIG } = require("../../../constants")
const V3AaveOracleABI = require("../../../artifacts/v3/AaveOracleABI")

/**
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} simulator - enso simulator instance
 */
class FetcherV3 extends Fetcher {
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
    this.simulator = simulator

    this.params = params
    this.helperContract = getHelper(this.params.protocol, this.provider, this.config)
    this.contract = new Contract(PROTOCOLS_CONFIG.V3.POOL, V3LendingPoolABI, this.provider)
  }
}

module.exports = { FetcherV3 }
