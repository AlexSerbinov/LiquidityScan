"use ctrict"
const { getUsersFromDataFetcherSet } = require("../../../redis")
const { EventEmitter } = require("node:events")
const { ethers } = require("ethers")

/**
 * import events logger constants from loggerTopicsConstants
 */
const {
  USERS_FROM_REDIS_TO_SIMULATION_BY_ASSEST,
  ALL_UNIQUE_USERS_FROM_REDIS_TO_SIMULATION,
  SIMULATION_PASSED_WITH_STATUS_SUCCESS,
  SIMULATION_PASSED_WITH_STATUS_FAILED,
  SIMULATION_ERROR,
  USER_SKIPPED_BY_LOW_HF,
  USER_SKIPPED_BY_HIGH_HF,
  ALL_BATCH_OF_USERS_SKIPPED_BY_HF,
  USER_ACCEPTED_BY_HF_AFTER_SIML_RESULT,
  NO_USERS_FROM_REDIS_BY_ASSEST,
  NO_USERS_FROM_REDIS_TO_SIMULATION,
  NUMBER_OF_USERS_TO_SIMULATION,
} = require("../../../../configs/loggerTopicsConstants")
/**
 * Abstract fetcher
 *
 * To request user data
 */
class TransmitFetcher extends EventEmitter {
  /**
   * @param {*} params -  object that contains all params from $.params
   * @param {*} filters - object that contains { minHF, maxHF }
   * @param {*} config - all configs from Main.json
   * @param {*} simulator - Simulator instance
   * @Note additional @param {number} maxNumberOfUsersToSimulate - The maximum number of users for parallel simulation in simulator.
   */

  constructor(params, filters, config, simulator) {
    super()
    this.filters = filters
    this.globalReservesData = null
    this.buffer = []
    this.config = config
    this.simulator = simulator
    this.params = params
    this.maxNumberOfUsersToSimulate = this.params.maxNumberOfUsersToSimulate
  }

  /**
   * Update global reserves through
   * this method
   * @param {*} data - global reserves
   * @returns {Fetcher}
   */
  setGlobalReservesData(data) {
    this.globalReservesData = data
    return this
  }

  async filterUser(user, hf, rawTransmit) {
    if (!this.globalReservesData) {
      this.emit("error", "global reserves data not set")
      return
    }
    const resp = await this.filterUserByLiqFilters(user, hf)

    const { liq } = resp ? resp : {}

    if (liq) {
      this.emit("liquidate", { resp, rawTransmit })
    }
  }

  /**
   * return users by array of assets
   */
  async getUsersByAsset(assets) {
    try {
      const protocol = this.getProtocol()
      const usersFromRedis = await Promise.all(
        assets.map(async asset => {
          try {
            const usersFromRedis = await getUsersFromDataFetcherSet(protocol, asset)
            if (usersFromRedis.length !== 0) {
              this.emit("info", `Users by asset: ${asset} | number of users: ${usersFromRedis.length}, users: ${usersFromRedis}`, USERS_FROM_REDIS_TO_SIMULATION_BY_ASSEST)
            } else {
              this.emit("info", `no users from redis by given asset: ${asset}`, NO_USERS_FROM_REDIS_BY_ASSEST)
            }
            return usersFromRedis
          } catch (error) {
            console.error(`Error fetching users for asset ${asset}:`, error)
            return []
          }
        })
      )

      const allUsers = [...new Set(usersFromRedis.flat())]
      if (allUsers.length === 0) {
        this.emit("info", "no users from redis by given asset", NO_USERS_FROM_REDIS_TO_SIMULATION)
        return allUsers
      } else {
        this.emit("info", `all unique users: ${allUsers.length} | Users: ${allUsers}`, ALL_UNIQUE_USERS_FROM_REDIS_TO_SIMULATION)
        this.emit("info", `${allUsers.length} - number of unique users to simulation`, NUMBER_OF_USERS_TO_SIMULATION)
        return allUsers
      }
    } catch (error) {
      console.error("Error in getUsersByAsset:", error)
      return []
    }
  }

  /**
   * TODO: Check price movement to define wich direction to go (collateral or borrow)
   * const asset = rtx.asset
   *
   * const assetPriceBeforeRTX = simulate( body: [tx.calldata: 0x000...getAssetPrice] )
   * const assetPriceAfterRTX = simulate( body: [tx.calldata: 0x000...getAssetPrice] )
   *
   * if (assetPriceBeforeRTX > assetPriceAfterRTX) const movement = dropp
   *
   * if (movement == dropp) >> get users where asset is in collateral
   * else >> get users where asset is in borrow
   */

  /**
   * Simulate transaction after transmit event
   */
  async simulate(userToSimulate, rawTransmit) {
    try {
      let body = this._createBody(userToSimulate, rawTransmit)
      let simulationResult = await this.simulator.simulate(body)
      let simulateData = []
      let succesSimulationCount = 0
      simulationResult.forEach((result, index) => {
        /* Skip the first element without id, becaise transmit transaction don't have id value. 
        Because we assign this value only for usual transaction
        */
        if (!result.transaction.id) return
        if (result.success) {
          succesSimulationCount++
          simulateData.push(result)
        } else {
          this.emit("info", `simulation for user: ${userToSimulate[index]} failed with error status`, SIMULATION_PASSED_WITH_STATUS_FAILED)
        }
      })
      if (succesSimulationCount > 0) this.emit("info", `simulation for ${succesSimulationCount}/${userToSimulate.length} users passed with success status`, SIMULATION_PASSED_WITH_STATUS_SUCCESS)
      return { simulateData, usersByAsset: userToSimulate, rawTransmit }
    } catch (error) {
      this.emit("errorMessage", error.message || error, SIMULATION_ERROR)
      throw error
    }
  }

  /**
   * filtered users by simulated hf
   * @param {object} data simulation result
   * This data recieved directly from AAVE lending pool. Not from our custom aggregator
   * Because that it's more quicker. And speed in transmit liquidations it's very important
   * @note @param {array} usersByAsset always contain <= maxNumberOfUsersToSimulate users
   */
  filterUserByHfAfterSimulationResult(data) {
    const simulateData = data.simulateData
    const usersByAsset = data.usersByAsset
    const { minHfLiq, maxHfLiq } = this.filters
    let usersToNextStageFiltering = []
    const abiDecode = this.getABIDecode()
    const abiCoder = new ethers.utils.AbiCoder()

    for (let i = 0; i < simulateData.length; i++) {
      const decodeData = abiCoder.decode(abiDecode, simulateData[i].returnData)

      let hf = decodeData.liquidity ? Number(decodeData.liquidity) : decodeData.healthFactor / 1e18

      if (decodeData.liquidity == 0) {
        usersToNextStageFiltering.push({ user: usersByAsset[i], hf })
      }

      if (hf < minHfLiq) {
        this.emit("info", `user: ${usersByAsset[i]} [skipped] by low HF with simulation result | HF: ${hf}, minHf: ${minHfLiq}`, USER_SKIPPED_BY_LOW_HF)
        continue
      }
      if (hf > maxHfLiq) {
        this.emit("info", `user: ${usersByAsset[i]} [skipped] by hight HF with simulation result | HF: ${hf}, maxHfLiq: ${maxHfLiq}`, USER_SKIPPED_BY_HIGH_HF)
        continue
      }

      usersToNextStageFiltering.push({ user: usersByAsset[i], hf })
      this.emit("info", `user: ${usersByAsset[i]} [accepted] by HF with simulation result | user HF: ${hf}, maxHfLiq: ${maxHfLiq}, minHf: ${minHfLiq}. This user goes to the next stage: find suitable borrow and collateral`, USER_ACCEPTED_BY_HF_AFTER_SIML_RESULT)
    }

    if (usersToNextStageFiltering.length === 0) this.emit("info", "no users to execute from batch simulation (find suitable borrow and collateral)", ALL_BATCH_OF_USERS_SKIPPED_BY_HF)

    return usersToNextStageFiltering
  }

  /**
   * create request for simulate every this.maxNumberOfUsersToSimulate (usual 30 - 50) users
   */
  async request(user, rawTransmit, last) {
    try {
      this.buffer.push(user)
      if (this.buffer.length >= this.maxNumberOfUsersToSimulate || last) {
        const userToSimulate = this.buffer
        this.buffer = []
        const response = await this.simulate(userToSimulate, rawTransmit)
        this.handleSimulationResponse(response)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * The function is called when the response from the simulator is received.
   * @param {object} data contain 3 sub objects:
   * 1-st: usersToSimulation: from 1 to maxNumberOfUsersToSimulate.
   * If usersToSimulation > maxNumberOfUsersToSimulate, "response" called multiple times by previous function.
   *  Example: 1-st: 30 users, 2-nd: 30 users, 3-rd: 20 users
   * 2-nd: rawTransmit object
   * 3-rd: simulationData: hex data with users data (HF, collaterral, borrow, etc.) with simulation result with transmit
   */
  async handleSimulationResponse(data) {
    if (data.simulateData.length == 0) return
    let usersToNextStageFiltering = this.filterUserByHfAfterSimulationResult(data)
    if (usersToNextStageFiltering.length == 0) return
    usersToNextStageFiltering.forEach(userData => this.filterUser(userData.user, userData.hf, data.rawTransmit))
  }

  /**
   * create body for request
   */
  _createBody(userToSimulate, rawTransmit) {
    let helperOwner = this.config.HELPER_OWNER_PUBLIC_ADDRESS
    let lendingPool = this.getLendingPool()
    let dataPrefix = this.getDataPrefix()
    let body = [
      {
        chainId: Number(rawTransmit.chainId),
        from: rawTransmit.from,
        to: rawTransmit.to,
        data: rawTransmit.data,
        gasLimit: Number(rawTransmit.gasLimit),
        value: rawTransmit.value.toString(),
      },
    ]
    for (let j = 0; j < userToSimulate.length; j++) {
      let userSlicetwo = userToSimulate[j].slice(2)
      let data = `${dataPrefix}${userSlicetwo}`
      body.push({
        id: j + 1, // Be super careful with this! As in simulation.ReturnedData we don't have a field for the user, that's why we assign users to data from the simulator manually. If this number is incorrect, you will assign some data to the previous or next user.
        from: helperOwner,
        to: lendingPool,
        data: data,
        gasLimit: Number(30000000),
        value: "0",
      })
    }
    return body
  }

  /**
   * Implement execution in the child class
   */
  filterUserByLiqFilters() {
    throw new Error("Method not implemented.")
  }
}

module.exports = { TransmitFetcher }
