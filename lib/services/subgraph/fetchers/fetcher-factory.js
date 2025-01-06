"use strict"
const { Fetcher } = require("./fetcher")
const { FetcherV1 } = require("./fetcher-aave-v1")
const { FetcherV2 } = require("./fetcher-aave-v2")
const { FetcherV3 } = require("./fetcher-aave-v3")
const { FetcherCompound } = require("./fetcher-compound")
const { FetcherLiquity } = require("./fetcher-liquity")
const { FetcherMarketDAO } = require("./fetcher-marker-dao")

const createFetcherV1 = (params, filters, config, simulator) => new FetcherV1(params, filters, config, simulator)
const createFetcherV2 = (params, filters, config, simulator) => new FetcherV2(params, filters, config, simulator)
const createFetcherV3 = (params, filters, config, simulator) => new FetcherV3(params, filters, config, simulator)
const createFetcherCompound = (params, filters, config, simulator) => new FetcherCompound(params, filters, config, simulator)
const createFetcherLiquity = (params, filters, simulator) => new FetcherLiquity(params, filters, simulator)
const createFetcherMarketDAO = (params, filters, simulator) => new FetcherMarketDAO(params, filters, simulator)

/**
 * Factory function to get the appropriate fetcher class
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} simulator - enso simulator instance
 * @returns {Fetcher} The fetcher instance
 */
const getFetcher = (params, filters, config, simulator) => {
  switch (params.protocol) {
    case "V1":
      return createFetcherV1(params, filters, config, simulator)
    case "V2":
      return createFetcherV2(params, filters, config, simulator)
    case "V3":
      return createFetcherV3(params, filters, config, simulator)
    case "Compound":
      return createFetcherCompound(params, filters, config, simulator)
    case "Liquity":
      return createFetcherLiquity(params, filters, simulator)
    case "MakerDAO_CDP":
      return createFetcherMarketDAO(params, filters, simulator)
    default:
      throw new Error(`Unsupported protocol: ${params.protocol}`)
  }
}

module.exports = { getFetcher }
