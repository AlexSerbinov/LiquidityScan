const { Fetcher } = require("./fetcher")
const { Contract } = require("ethers")

const { getHelper } = require("../../../helpers/onchain-aggregator")

/* Pool contract */
const V1LendingPoolABI = require("../../../artifacts/v1/LendingPoolABI")
const { PROTOCOLS_CONFIG } = require("../../../constants")

/**
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} simulator - enso simulator instance
 */
class FetcherV1 extends Fetcher {
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
    this.simulator = simulator

    this.params = params
    this.helperContract = getHelper(this.params.protocol, this.provider, this.config)
    this.contract = new Contract(PROTOCOLS_CONFIG.V1.POOL, V1LendingPoolABI, this.provider)
  }
}

module.exports = { FetcherV1 }
