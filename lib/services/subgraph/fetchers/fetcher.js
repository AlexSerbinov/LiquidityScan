const { EventEmitter } = require("node:events")
const { getProvider } = require("../../../ethers/pool")
const { BigNumber } = require("bignumber.js")
const { ethers } = require("ethers")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { USER_SKIPPED_BY_LOW_HF, USER_SKIPPED_BY_HIGH_HF, USER_SKIPPED_BY_LOW_COLLATERAL, USER_SKIPPED_BY_LOW_BORROW, USER_ACCEPTED, SIMULATION_SUCCESS, SIMULATION_ERROR, PROVIDER_ERROR } = require("../../../../configs/loggerTopicsConstants")

class Fetcher extends EventEmitter {
  /**
   * @param {*} params - params object from [protocol]filters.json param field
   * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
   * @param {*} config - all configs settings from Main.json
   * @param {*} simulator - enso simulator instance
   */
  constructor(params, filters, config, simulator) {
    super()
    if (new.target === Fetcher) {
      throw new TypeError("Cannot construct Fetcher instances directly")
    }

    const provider = getProvider()

    provider.on("error", e => this.resetProvider())

    this.filters = filters
    this.config = config
    this.params = params
    this.wallet = new ethers.Wallet(this.config.HELPER_OWNER_PRIVATE_KEY)

    this.provider = provider
    this.blockNumber = null

    this.globalReservesData = null
    this.simulator = simulator
  }

  /**
   * Getting user total debt and collateral
   * @param {string} address
   * @returns {Promise<{healthFactor: number, totalCollateralETH: number, totalBorrowsETH: number}>}
   */

  async getUsersData(addresses) {
    try {
      const resp = await this.prepareAndSimulateTransaction(addresses)
      if (resp[0].user && resp[0].user != 0x0) {
        const message = `Simulation SUCCESS`
        this.emit("info", message, SIMULATION_SUCCESS)
      } else {
        const message = `Simulation FAILLED.`
        this.emit("info", message, SIMULATION_ERROR)
      }
      return resp
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Main function to analyze healthFactor, debt and collateral for users
   * @param {object} options
   * @param {object} user addresses - users addresses.
   * @param {string} [options.blockTag="latest"]
   * @returns {Promise<Array<{}>>} - filtered list of users
   */

  async loadUsersReserves({ addresses, blockTag }) {
    try {
      const { min_health_factor, max_health_factor, min_borrow_amount, min_collateral_amount } = this.filters

      const minCollateralAmount = min_collateral_amount * 10 ** 18
      const minBorrowAmount = min_borrow_amount * 10 ** 18

      const usersData = await this.getUsersData(addresses, blockTag)

      const filteredUsers = []
      for (const userData of usersData) {
        try {
          const { user, healthFactor, totalCollateralETH, totalBorrowsETH } = userData

          const calcHealthFactor = healthFactor / 10 ** 18
          const totalCollateralETHB = new BigNumber(totalCollateralETH.toString())
          const totalBorrowsETHB = new BigNumber(totalBorrowsETH.toString())

          if (calcHealthFactor < min_health_factor) {
            this.emit("info", `user: ${user} [skipped] | HF: ${calcHealthFactor}, minHF: ${min_health_factor}`, USER_SKIPPED_BY_LOW_HF)
            continue
          }
          if (calcHealthFactor > max_health_factor) {
            this.emit("info", `user: ${user} [skipped] | HF: ${calcHealthFactor}, maxHF: ${max_health_factor}`, USER_SKIPPED_BY_HIGH_HF)
            continue
          }

          if (totalCollateralETHB.lt(minCollateralAmount)) {
            this.emit("info", `user: ${user} [skipped] | totalCollateralETH: ${totalCollateralETHB.dividedBy(10 ** 18).toString()}, minCollateral: ${minCollateralAmount / 10 ** 18}`, USER_SKIPPED_BY_LOW_COLLATERAL)
            continue
          }

          if (totalBorrowsETHB.lt(minBorrowAmount)) {
            this.emit("info", `user: ${user} [skipped] | totalBorrowsETH: ${totalBorrowsETHB.dividedBy(10 ** 18).toString()}, maxBorrow: ${minBorrowAmount / 10 ** 18}`, USER_SKIPPED_BY_LOW_BORROW)
            continue
          }
          filteredUsers.push({ user })
          this.emit("info", `user: ${user} [accepted] | HF: ${calcHealthFactor}, totalCollateralETH: ${totalCollateralETHB.dividedBy(10 ** 18).toString()}, totalBorrowsETH: ${totalBorrowsETHB.dividedBy(10 ** 18).toString()}`, USER_ACCEPTED)
        } catch (e) {
          console.error(`Error - loadUsersReserves for address ${userData.user} - ${e}`)
          this.emit("error", `Error - loadUsersReserves for address ${userData.user} - ${e}`)
        }
      }
      return filteredUsers
    } catch (error) {
      console.error(`Error - loadUsersReserves - ${error}`)
      this.emit("error", `Error - loadUsersReserves - ${error}`)
      throw error
    }
  }

  /**
   * Get timestamp for latest block
   * @param {Provider} provider - Provider from @ethers
   * @returns {number} latest block timestamp
   */
  async getLatestTimestamp() {
    const block = await this.provider.getBlock("latest")
    const { timestamp } = block
    return timestamp
  }

  /**
   * Fetch user reserves data
   * and make decision what to do next:
   *
   * - Send to searcher
   * - Skip
   *
   * @param {{object}} usersData - users addresses
   */
  async fetchSubgraphUsers(usersData) {
    try {
      this.blockNumber = await this.provider.getBlockNumber()
      if (!this.blockNumber) this.emit("errorMessage", "this.provider.getBlockNumber() failed", PROVIDER_ERROR)

      const filteredUsers = await this.loadUsersReserves({
        addresses: usersData,
        blockTag: this.blockNumber,
      })

      filteredUsers.forEach(filteredUser => {
        const { user, error } = filteredUser
        if (user && !error) {
          const lowercaseUser = user.toLowerCase()
          this.emit("fetch", { user: lowercaseUser }) // be careful. This is not a log message!
        }
        if (user && error) {
          this.emit("errorMessage", filteredUser)
        }
      })
    } catch (error) {
      this.emit("errorMessage", error)
      throw error
    }
  }

  /**
   * Prepares and simulates a transaction, then formats the result.
   * @param {Array} addresses - The addresses involved in the transaction.
   * @returns {object} ted simulation result.
   */
  async prepareAndSimulateTransaction(addresses) {
    try {
      const transaction = await this.createTransaction(addresses)
      const simulationResult = await this.simulateTransaction(transaction)
      return this.formatSimulationResult(simulationResult)
    } catch (error) {
      throw error
    }
  }

  /**
   * Creates a transaction object with the given parameters.
   * @param {Array} addresses - The addresses to include in the transaction.
   * @returns {object} The transaction object.
   */
  async createTransaction(addresses) {
    const stateOverrideKey = Object.keys(this.params.stateOverrides)[0]
    const stateOverrideCode = this.params.stateOverrides[stateOverrideKey].code

    return {
      id: 1,
      chainId: 1,
      from: this.wallet.address,
      to: this.params.simulationContract,
      gasLimit: 300000000000000000,
      data: await this.encode(addresses),
      stateOverrides: stateOverrideCode,
      formattedTrace: false,
    }
  }

  /**
   * Simulates a transaction and returns the result.
   * @param {object} transaction - The transaction to simulate.
   * @returns {object} The result of the simulation.
   */
  async simulateTransaction(transaction) {
    try {
      const bundle = [transaction]
      const resp = await this.simulator.simulate(bundle)
      return resp
    } catch (error) {
      this.emit("errorMessage", error, SIMULATION_ERROR)
      throw error
    }
  }

  /**
   * Formats the raw simulation result into a more readable form.
   * @param {object} simulationResult - The raw simulation result.
   * @returns {Array} formatted simulation results.
   */
  async formatSimulationResult(simulationResult) {
    try {
      if (simulationResult.size === 0) {
        throw new Error("simulationResult is empty")
      }
      const returnData = simulationResult.get(1).returnData
      const abiDecode = this.getABIDecode()
      const decodedData = ethers.utils.defaultAbiCoder.decode(abiDecode, returnData)

      return decodedData[0].map(data => ({
        user: data.user,
        totalCollateralETH: data.totalCollateralETH.toString(),
        totalBorrowsETH: data.totalBorrowsETH.toString(),
        healthFactor: data.healthFactor.toString(),
      }))
    } catch (error) {
      // if we have error on simulation we log the error on level earlier
      return [
        {
          user: "0x0",
          totalCollateralETH: "0",
          totalBorrowsETH: "0",
          healthFactor: "0",
        },
      ]
    }
  }

  /**
   * Encodes the addresses into a single data string using the contract's ABI.
   * @param {Array} addresses - The addresses to encode.
   * @returns {string} The encoded data string.
   */
  async encode(addresses) {
    return this.params.selector + ethers.utils.defaultAbiCoder.encode(["address[]"], [addresses]).substring(2)
  }

  /**
   * Update global reserves through
   * this method
   * @param {*} data - global reserves
   * @returns {Fetcher}
   */
  setGlobalReservesData(data) {
    this.globalReservesData = data
    this.emit("fetcherReady", {})
    return this
  }

  /**
   * Reset current and get new provider
   */
  resetProvider() {
    this.provider = getProvider()
  }

  /**
   * Get current RPC provider
   * @returns {Provider} - provider from @npm/ethers
   */
  getProvider() {
    return this.provider
  }

  /**
   * Get abi of functions to decode result
   */
  getABIDecode() {
    return ["tuple(address user,uint256 totalCollateralETH,uint256 totalBorrowsETH,uint256 healthFactor)[]"]
  }

  /**
   * some actions after created Fetcher instance
   */
  async init() {}
}

module.exports = { Fetcher }
