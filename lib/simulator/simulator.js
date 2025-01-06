"use strict"
const { assert } = require("../utils/assert")
const { prepareBundle, request } = require("./utils")

/**
 * Interface for enso transaction simulator
 */
class Simulator {
  /**
   * @param {string} url - enso simulator url
   * @param {boolean} formattedTrace - include formatted formattedTrace
   * @param {*} stateOverrides - Override blockchain
   * storage state for simulation
   */
  constructor(url, formattedTrace, stateOverrides) {
    assert(url, "URL is required.", "system", { url })
    this.url = url
    this.formattedTrace = formattedTrace || false
    this.stateOverrides = stateOverrides || null
  }

  /**
   * Simulate transactions bundle by enso
   * @param {[*]} transactions - transaction for simulation
   * @returns {Map} id -> simulation result
   * {
        gasUsed, totalGas,
        returnData, success,
        formattedTrace
      }
   */
  async simulate(transactions) {
    const { url, formattedTrace, stateOverrides } = this

    /**
     * Prepare
     */
    const bundle = prepareBundle(transactions, formattedTrace, stateOverrides)
    /**
     * Simulate
     */
    try {
      const response = await request(bundle, url)

      /**
       * Map of simulation results by id
       * 1-st elem it's always transmit
       * 2-nd and next it's data for each user (hf, borrow, collateral, etc.)
       */
      const result = new Map()

      /**
       * Fill result map
       */
      response.forEach((simulation, index) => {
        const { success, formattedTrace } = simulation

        const gasUsed = BigInt(simulation.gasUsed)
        const totalGas = BigInt(simulation.totalGas)
        const returnData = simulation.returnData === "0x" ? 0n : simulation.returnData
        const transaction = transactions[index]
        const { id } = transaction

        result.set(id, {
          gasUsed,
          totalGas,
          returnData,
          success,
          formattedTrace,
          transaction,
        })
      })

      return result
    } catch (error) {
      throw error
    }
  }
}

/**
 * @param {string} url - enso simulator url
 * @param {boolean} formattedTrace - include formatted formattedTrace
 * @param {*} stateOverrides - Override blockchain
 * storage state for simulation
 */
const createSimulator = (url, formattedTrace, stateOverrides) => new Simulator(url, formattedTrace, stateOverrides)
module.exports = { createSimulator, Simulator }
