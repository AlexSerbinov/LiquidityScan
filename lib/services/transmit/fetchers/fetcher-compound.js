const { TransmitFetcherAave } = require("./fetcher-aave")
const { getHelper } = require("../../../helpers/onchain-aggregator")
const { PROTOCOLS_CONFIG } = require("../../../constants")
const { ethers } = require("ethers")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { USER_SKIPPED_BY_HIGH_HF, ALL_BATCH_OF_USERS_SKIPPED_BY_HF, USER_ACCEPTED_BY_HF_AFTER_SIML_RESULT } = require("../../../../configs/loggerTopicsConstants")

class TransmitCompound extends TransmitFetcherAave {
  /**
   * @param {*} params -  object that contains all params from $.params
   * @param {*} filters - object that contains { minHF, maxHF }
   * @param {*} config - all configs from Main.json
   * @param {*} simulator - Simulator instance
   */
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
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

      let hf = decodeData.liquidity ? 1.1 : 0.99

      if (decodeData.liquidity == 0) {

        usersToNextStageFiltering.push({ user: usersByAsset[i], hf })
        this.emit("info", `user: ${usersByAsset[i]} [accepted] can be liquidated| HF < 1`, USER_ACCEPTED_BY_HF_AFTER_SIML_RESULT)
      } else if (decodeData.liquidity > 0) {

        this.emit("info", `user: ${usersByAsset[i]} [skipped] can't be liquidated| HF > 1`, USER_SKIPPED_BY_HIGH_HF)
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
   * Gett aave helper contract
   * @param {Provider} - rpc provider
   * @returns {Helper}
   */
  getContract(provider) {
    const helper = getHelper("Compound", provider, this.config)
    helper.setGlobalReserves(this.globalReservesData)
    return helper
  }

  getProtocol() {
    return "Compound"
  }

  getLendingPool() {
    return PROTOCOLS_CONFIG.Compound.CONTROLLER
  }

  /**
   * This method interacts with the Compound protocol's Controller contract to determine
   * the liquidity status of a user's account. It calls the `getAccountLiquidity` function
   * of the Comptroller, which returns a tuple of three values: (error, liquidity, shortfall).
   *
   * The `liquidity` value (`liquidateData[1]`) represents the account's available liquidity in
   * the Compound protocol. It indicates the USD value that the user can still borrow before
   * their position becomes subject to liquidation.
   *
   * If `liquidity` is equal to 0, it means that the user's account has no available liquidity
   * and CAN BE LIQUIDATED. In this case, the method returns a fixed value of 0.99.
   *
   * On the other hand, if `liquidity` is greater than 0, the method returns the provided
   * `healthFactor` divided by 10^18. As I undrestand, in this case HF will be > 1, so we return real HF
   */
  getABIDecode() {
    // return ["uint256", "uint256 CanLiquidate", "uint256 Liquidate"]
    return ["uint256 error", "uint256 liquidity", "uint256 shortfall"]
  }

  getDataPrefix() {
    return "0x5ec88c79000000000000000000000000"
  }
}
module.exports = { TransmitCompound }
