const { Fetcher } = require("./fetcher")
const { getHelper } = require("../../../helpers/onchain-aggregator")

class FetcherCompound extends Fetcher {
  /**
   * @param {*} params - params object from [protocol]filters.json param field
   * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
   * @param {*} config - all configs settings from Main.json
   * @param {*} simulator - enso simulator instance
   */
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
  }
}
module.exports = { FetcherCompound }
