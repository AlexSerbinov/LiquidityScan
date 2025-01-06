"use strict"
const { HelperV1 } = require("./helper-aave-v1")
const { HelperV2 } = require("./helper-aave-v2")
const { HelperV3 } = require("./helper-aave-v3")
const { HelperCompound } = require("./helper-compound")

/**
 * Factories
 * @param {Provider} provider
 * @returns {HelperBase} The helper instance
 */
const createHelperV1 = (provider, config) => new HelperV1(provider, config)
const createHelperV2 = (provider, config) => new HelperV2(provider, config)
const createHelperV3 = (provider, config) => new HelperV3(provider, config)
const createHelperCompound = (provider, config) => new HelperCompound(provider, config)

/**
 * Factory function to get the appropriate helper class
 * @param {string} protocol - The protocol of the protocol ('V1', 'V2', 'V3' or 'Compound')
 * @param {Provider} provider - ethers/Provider
 * @returns {HelperBase} The helper instance
 */
function getHelper(protocol, provider, config) {
  switch (protocol) {
    case "V1":
      return createHelperV1(provider, config)
    case "V2":
      return createHelperV2(provider, config)
    case "V3":
      return createHelperV3(provider, config)
    case "Compound":
      return createHelperCompound(provider, config)
    default:
      throw new Error(`Unsupported protocol protocol: ${protocol}`)
  }
}

module.exports = { getHelper, createHelperV1, createHelperV2, createHelperV3, createHelperCompound }
