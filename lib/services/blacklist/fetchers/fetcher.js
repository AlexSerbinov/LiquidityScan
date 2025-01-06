const { EventEmitter } = require("node:events")
const { getProvider } = require("../../../ethers/pool")
const { ethers } = require("ethers")
const { BigNumber } = require("bignumber.js")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { SIMULATION_SUCCESS, SIMULATION_ERROR, ADD_TO_BLACKLIST_BY_LOW_HF, ADD_TO_BLACKLIST_BY_HIGH_HF, ADD_TO_BLACKLIST_BY_LOW_BORROW, ADD_TO_BLACKLIST_BY_LOW_COLLATERAL, REMOVE_USER_FROM_BLACKLIST } = require("../../../../configs/loggerTopicsConstants")

/**
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} simulator - enso simulator instance
 */
class Fetcher extends EventEmitter {
  constructor(params, filters, config, simulator) {
    super()
    if (new.target === Fetcher) {
      throw new TypeError("Cannot construct Fetcher instances directly")
    }

    const provider = getProvider()
    provider.on("error", e => this.resetProvider())

    this.params = params
    this.config = config
    this.simulator = simulator
    this.filters = filters
    this.provider = provider

    this.helperContract = null
    this.contract = null
    this.globalReservesData = null
    this.wallet = new ethers.Wallet(this.config.HELPER_OWNER_PRIVATE_KEY)
  }

  // /**
  //  * Getting user total debt and collateral
  //  * @param {string} address
  //  * @param {string} blockTag
  //  * @returns {Promise<{healthFactor: number, totalCollateralETH: number, totalBorrowsETH: number}>}
  //  */
  async getUserDataFromNode(address, blockTag) {
    const userData = await this.contract.getUserAccountData(address, {
      blockTag,
    })

    return {
      healthFactor: userData.healthFactor,
      totalCollateralETH: userData.totalCollateralETH,
      totalBorrowsETH: userData.totalBorrowsETH,
    }
  }

  /**
   * Getting user total debt and collateral
   * @param {string} address
   * @param {string} blockTag
   * @returns {Promise<{healthFactor: number, totalCollateralETH: number, totalBorrowsETH: number}>}
   */

  async getUserDataFromSimulator(addresses) {
    try {
      const resp = await this.prepareAndSimulateTransaction(addresses)
      if (resp[0].user && resp[0].user != 0x0) {
        this.emit("info", `Simulation SUCCESS`, SIMULATION_SUCCESS)
      } else {
        this.emit("info", `Simulation FAILLED`, SIMULATION_ERROR)
      }
      return resp
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Main function to analyze healthFactor, debt and collateral for user(s)
   * @param {object} options
   * @param {string} options.address - user address.
   * @param {string} [options.blockTag="latest"]
   * @returns {Promise<Array>} - filtered list of users
   */
  async loadUserReserves({ addresses, blockTag = "latest" }) {
    try {
      const { min_health_factor, max_health_factor, min_borrow_amount, min_collateral_amount } = this.filters

      const minBorrowAmount = min_borrow_amount * 10 ** 18
      const minCollateralAmount = min_collateral_amount * 10 ** 18

      let userDataList = []

      // simulator returned array of users, node return only 1 user
      if (this.params.useSimulatorInsteadOfNode) {
        // We use a delay between requests. Without the delay, the blacklist would overload
        // the simulator to its full capacity. We want to avoid this, so we set a delay.
        await new Promise(resolve => setTimeout(resolve, this.params.delayBetweenRequestsToSimulator || 1))
        userDataList = await this.getUserDataFromSimulator(addresses, blockTag)
      } else if (!this.params.useSimulatorInsteadOfNode) {
        // If we use node (useSimulatorInsteadOfNode == false) in addresses array we always have only 1 user, thats why addresses[0]
        const userData = await this.getUserDataFromNode(addresses[0], blockTag)

        // Wrap single user data in an array for consistent processing and add user property to match the expected format
        userDataList = [{ ...userData, user: addresses }]
      } else {
        throw new Error("Mode should be 'node' or 'simulator'")
      }

      return userDataList.map(({ user, healthFactor, totalCollateralETH, totalBorrowsETH }) => {
        const calcHealthFactor = healthFactor / 10 ** 18
        const totalCollateralETHB = new BigNumber(totalCollateralETH.toString())
        const totalBorrowsETHB = new BigNumber(totalBorrowsETH.toString())

        if (calcHealthFactor < min_health_factor) {
          this.emit("info", `user: ${user} [add] to blacklist | HF: ${calcHealthFactor}, minHF: ${min_health_factor}`, ADD_TO_BLACKLIST_BY_LOW_HF)
          return { user, add: true }
        }
        if (calcHealthFactor > max_health_factor) {
          this.emit("info", `user: ${user} [add] to blacklist | HF: ${calcHealthFactor}, maxHF: ${max_health_factor}`, ADD_TO_BLACKLIST_BY_HIGH_HF)
          return { user, add: true }
        }

        if (totalCollateralETHB.lt(minCollateralAmount)) {
          this.emit("info", `user: ${user} [add] to blacklist | totalCollateralETH: ${totalCollateralETHB.dividedBy(10 ** 18).toString()}, minCollateral: ${minCollateralAmount / 10 ** 18}`, ADD_TO_BLACKLIST_BY_LOW_COLLATERAL)
          return { user, add: true }
        }

        if (totalBorrowsETHB.lt(minBorrowAmount)) {
          this.emit("info", `user: ${user} [add] to blacklist | totalBorrowsETH: ${totalBorrowsETHB.dividedBy(10 ** 18).toString()}, maxBorrow: ${minBorrowAmount / 10 ** 18}`, ADD_TO_BLACKLIST_BY_LOW_BORROW)
          return { user, add: true }
        }

        this.emit("info", `user: ${user} [removed] from blacklist | HF: ${calcHealthFactor}, totalCollateralETH: ${totalCollateralETHB.dividedBy(10 ** 18).toString()}, totalBorrowsETH: ${totalBorrowsETHB.dividedBy(10 ** 18).toString()}`, REMOVE_USER_FROM_BLACKLIST)
        return { user, add: false }
      })
    } catch (e) {
      console.error(e)
      this.emit("error", `loadUserReserves - ${e}`)
      return [{ user: addresses, error: `loadUserReserves - ${e}` }]
    }
  }

  /**
   * Fetch user reserves data
   * and make decision what to do next:
   *
   * - Send to searcher
   * - Skip
   *
   * @param {string} userData - user address
   */
  async fetchUser(userData) {
    const filteredUsers = await this.loadUserReserves({
      addresses: userData,
    })

    filteredUsers.forEach(filteredUser => {
      const { user, error } = filteredUser
      if (user && !error) this.emit("fetch", filteredUser)
      if (user && error) this.emit("error", filteredUser)
    })
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
      console.error(error)
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
   * Release current and get new provider
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

  getABIDecode() {
    return ["tuple(address user,uint256 totalCollateralETH,uint256 totalBorrowsETH,uint256 healthFactor)[]"]
  }

  /**
   * some actions after created Fetcher instance
   */
  async init() {}
}

module.exports = { Fetcher }
