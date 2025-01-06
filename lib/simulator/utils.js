"use strict"
const axios = require("axios")

/**
 * Make transaction objects array
 * comparable with enso
 * @param {[*]} txs - transactions array
 * @param {boolean} formattedTrace - include formatted formattedTrace
 * to result or not
 * @param {*} stateOverrides - Override blockchain
 * storage state for simulation
 * @returns {[*]} formated transactions bundle
 */
function prepareBundle(txs, formattedTrace, stateOverrides) {
  const bundle = []
  for (const tx of txs) {
    const { type, from, to, gasLimit, value, accessList, data } = tx

    bundle.push({
      chainId: 1,
      type,
      from,
      to,
      formattedTrace,
      data,
      gasLimit: gasLimit ? parseInt(gasLimit) : 3000000,
      value: value ? value.toString() : "0000000000",
      accessList: accessList ? accessList : [],
    })
  }

  /**
   * Overriding storage state in first
   * transaction in bundle
   */
  if (stateOverrides) Object.assign(bundle[0], { stateOverrides })

  return bundle
}

/**
  * Request simulation of transaction bundle
  * @param {[*]} txs - transaction objects array
  * @returns {*} example: [
    {
      simulationId: 1,
      totalGas: 205738,
      gasUsed: 205738,
      gasRefund: 0,
      blockNumber: 18291925,
      success: false,
      formattedTrace: [Array],
      formattedTrace: null,
      logs: [Array],
      exitReason: 'Revert',
      returnData: '0x01'
    }
  ]
  */

async function request(txs, url) {
  try {
    const result = await axios.post(url, txs)
    const { data } = result
    return data
  } catch (error) {
    console.error(error)
    let errorMessage
    if (error.response && error.response.data) {
      errorMessage = `Error ${error.response.data.code}: ${error.response.data.message}`
    } else {
      errorMessage = error.message || "Simulation error"
    }
    console.error("Simulator request failed:", errorMessage)
    throw new Error(errorMessage)
  }
}

module.exports = request

module.exports = {
  prepareBundle,
  request,
}
