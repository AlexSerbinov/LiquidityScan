const { Fetcher } = require("./fetcher")
const { Contract } = require("ethers")
const { BigNumber } = require("bignumber.js")

/* Helper contract */
const { getHelper } = require("../../../helpers/onchain-aggregator")

/* Pool contract */
const V3LendingPoolABI = require("../../../artifacts/v3/PoolABI")
const { PROTOCOLS_CONFIG } = require("../../../constants")
const V3AaveOracleABI = require("../../../artifacts/v3/AaveOracleABI")

/**
 * @param {*} filters - object that contains { minHF, maxHF, minBorrow ...}
 * @param {*} config - all configs settings from Main.json
 * @param {*} params - params object from [protocol]filters.json param field
 * @param {*} simulator - enso simulator instance
 */
class FetcherV3 extends Fetcher {
  constructor(params, filters, config, simulator) {
    super(params, filters, config, simulator)
    this.config = config
    this.params = params
    this.simulator = simulator
    this.helperContract = getHelper(this.params.protocol, this.provider, config)
    this.contract = new Contract(PROTOCOLS_CONFIG.V3.POOL, V3LendingPoolABI, this.provider)
    this.oracleContract = new Contract("0x54586bE62E3c3580375aE3723C145253060Ca0C2", V3AaveOracleABI, this.provider)
  }

  async getUserDataFromNode(address, blockTag) {
    const { healthFactor, totalCollateralBase, totalDebtBase } = await this.contract.getUserAccountData(address, {
      blockTag,
    })

    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    const WETHPriceDecimal = 8
    const WETHPrice = await this.oracleContract.getAssetPrice(WETHAddress, {
      blockTag,
    })

    const WETHPriceB = new BigNumber(WETHPrice.toString())
    const totalCollateralBaseB = new BigNumber(totalCollateralBase.toString())
    const totalDebtBaseB = new BigNumber(totalDebtBase.toString())
    const base = new BigNumber(10 ** 18)

    const totalCollateralETH = totalCollateralBaseB.div(WETHPriceB).times(base).toFixed(0)
    const totalBorrowsETH = totalDebtBaseB.div(WETHPriceB).times(base).toFixed(0)

    return {
      healthFactor,
      totalCollateralETH,
      totalBorrowsETH,
    }
  }
}

module.exports = { FetcherV3 }
