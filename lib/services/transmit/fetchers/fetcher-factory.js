const { TransmitFetcher } = require("./fetcher")
const { TransmitV1 } = require("./fetcher-aave-v1")
const { TransmitV2 } = require("./fetcher-aave-v2")
const { TransmitV3 } = require("./fetcher-aave-v3")
const { TransmitCompound } = require("./fetcher-compound")

/**
 * Factories
 * @returns {TransmitFetcher}
 */
const createV1TransmitFetcher = (params, filters, config, simulator) => new TransmitV1(params, filters, config, simulator)
const createV2TransmitFetcher = (params, filters, config, simulator) => new TransmitV2(params, filters, config, simulator)
const createV3TransmitFetcher = (params, filters, config, simulator) => new TransmitV3(params, filters, config, simulator)
const createCompoundTransmitFetcher = (params, filters, config, simulator) => new TransmitCompound(params, filters, config, simulator)

/**
 * Factory function to get the appropriate TransmitFetcher( class
 * @param {*} params -  object that contains all params from $.params
 * @param {*} filters - object that contains { minHF, maxHF }
 * @param {*} config - all configs from Main.json
 * @param {*} simulator - Simulator instance
 * @returns {TransmitFetcher} The fetcher instance
 */
const createTransmitFetcher = (params, filters, config, simulator) => {
  if (params.protocol === "V1") return createV1TransmitFetcher(params, filters, config, simulator)
  if (params.protocol === "V2") return createV2TransmitFetcher(params, filters, config, simulator)
  if (params.protocol === "V3") return createV3TransmitFetcher(params, filters, config, simulator)
  if (params.protocol === "Compound") return createCompoundTransmitFetcher(params, filters, config, simulator)
  throw new Error("Invalid protocol.")
}

module.exports = {
  TransmitFetcher,
  TransmitV1,
  TransmitV2,
  TransmitV3,
  TransmitCompound,
  createV1TransmitFetcher,
  createV2TransmitFetcher,
  createV3TransmitFetcher,
  createCompoundTransmitFetcher,
  createTransmitFetcher,
}
