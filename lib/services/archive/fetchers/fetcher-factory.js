const { Fetcher } = require("./fetcher")
const { FetcherV1 } = require("./fetcher-aave-v1")
const { FetcherV2 } = require("./fetcher-aave-v2")
const { FetcherV3 } = require("./fetcher-aave-v3")
const { FetcherCompound } = require("./fetcher-compound")
const { FetcherLiquity } = require("./fetcher-liquity")
const { FetcherMakerDAO } = require("./fetcher-maker-dao")

/**
 * Factories
 * @returns {Fetcher}
 */
const createV1Fetcher = protocol => new FetcherV1(protocol)
const createV2Fetcher = protocol => new FetcherV2(protocol)
const createV3Fetcher = protocol => new FetcherV3(protocol)
const createCompoundFetcher = protocol => new FetcherCompound(protocol)
const createLiquityFetcher = protocol => new FetcherLiquity(protocol)
const createMakerDAOFetcher = protocol => new FetcherMakerDAO(protocol)

/**
 * actory function to get the appropriate fetcher class
 * @param {string} protocol - protocol name (V1, V2, V3, Compound, )
 * @returns {Fetcher} The fetcher instance
 */
const getFetcher = protocol => {
  if (protocol === "V1") return createV1Fetcher(protocol)
  if (protocol === "V2") return createV2Fetcher(protocol)
  if (protocol === "V3") return createV3Fetcher(protocol)
  if (protocol === "Compound") return createCompoundFetcher(protocol)
  if (protocol === "Liquity") return createLiquityFetcher(protocol)
  if (protocol === "MakerDAO_CDP") return createMakerDAOFetcher(protocol)
  throw new Error("Invalid protocol.")
}

module.exports = {
  getFetcher,
}
