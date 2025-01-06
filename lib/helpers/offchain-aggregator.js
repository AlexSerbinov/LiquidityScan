const { Contract } = require("ethers")
const CTokenABI = require("../artifacts/compound/CTokenABI")
const CompoundABI = require("../artifacts/compound/CompoundABI")
const V1OracleABI = require("../artifacts/v1/OracleABI")
const V1LendingPoolABI = require("../artifacts/v1/LendingPoolABI")
const V1LendingPoolCoreABI = require("../artifacts/v1/LendingPoolCoreABI")
const V2LendingPoolABI = require("../artifacts/v2/LendingPoolABI")
const V2OracleABI = require("../artifacts/v2/OracleABI")
const ProtocolDataProviderV2ABI = require("../artifacts/v2/ProtocolDataProviderABI")
const V3PoolABI = require("../artifacts/v3/PoolABI")
const V3AaveOracleABI = require("../artifacts/v3/AaveOracleABI")
const ProtocolDataProviderV3ABI = require("../artifacts/v3/PoolDataProviderABI")
const provider = require("../ethers")
const { PROTOCOLS_CONFIG, ORACLE } = require("../constants")

const { getArchiveProvider } = require("../ethers/archiveProvider")
const { getTokenDecimals } = require("./utils")

const loadV1ReservesData = async (blockTag = "latest") => {
  const _provider = blockTag === "latest" ? provider : getArchiveProvider()
  const globalReservesData = {}

  const poolContract = new Contract(PROTOCOLS_CONFIG.V1.POOL, V1LendingPoolABI, _provider)
  const oracleContract = new Contract(ORACLE, V1OracleABI, _provider)
  const plCoreContract = new Contract(PROTOCOLS_CONFIG.V1.CORE, V1LendingPoolCoreABI, _provider)

  const reserves = await poolContract.getReserves({
    blockTag,
  })

  await Promise.all(
    reserves.map(async address => {
      const [price, decimals, bonus] = await Promise.all([
        oracleContract.getAssetPrice(address, {
          blockTag,
        }),
        plCoreContract.getReserveDecimals(address, {
          blockTag,
        }),

        plCoreContract.getReserveLiquidationBonus(address, {
          blockTag,
        }),
      ])

      globalReservesData[address] = {
        price,
        decimals,
        bonus: bonus % 100,
      }
    })
  )

  return globalReservesData
}

//Helper.sol fully supports loadV1ReservesData (add totalDebt & totalCollateral)

const loadV2ReservesData = async (blockTag = "latest") => {
  const _provider = blockTag === "latest" ? provider : getArchiveProvider()

  const pool = new Contract(PROTOCOLS_CONFIG.V2.POOL, V2LendingPoolABI, _provider)
  const protocolDataProvider = new Contract(PROTOCOLS_CONFIG.V2.DATA_PROVIDER, ProtocolDataProviderV2ABI, _provider)
  const oracle = new Contract(ORACLE, V2OracleABI, _provider)

  const reserves = await pool.getReservesList({
    blockTag,
  })

  const reservesData = {}

  await Promise.all(
    reserves.map(async address => {
      const [price, decimals, { liquidationBonus }] = await Promise.all([
        oracle.getAssetPrice(address, { blockTag }),
        getTokenDecimals(address),
        protocolDataProvider.getReserveConfigurationData(address, {
          blockTag,
        }),
      ])

      reservesData[address] = {
        price,
        decimals,
        bonus: (liquidationBonus % 1000) / 100,
      }
    })
  )

  return reservesData
}

//Helper.sol fully supports loadV2ReservesData (add totalDebt & totalCollateral)

const loadV3ReservesData = async (blockTag = "latest") => {
  const _provider = blockTag === "latest" ? provider : getArchiveProvider()

  const globalReservesData = {}

  const poolContract = new Contract("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", V3PoolABI, _provider)
  const protocolDataProvider = new Contract(PROTOCOLS_CONFIG.V3.DATA_PROVIDER, ProtocolDataProviderV3ABI, provider)
  const oracleContract = new Contract("0x54586bE62E3c3580375aE3723C145253060Ca0C2", V3AaveOracleABI, _provider)

  const reserves = await poolContract.getReservesList({
    blockTag,
  })

  await Promise.all(
    reserves.map(async address => {
      const [price, decimals, { liquidationBonus }] = await Promise.all([
        oracleContract.getAssetPrice(address, {
          blockTag,
        }),
        getTokenDecimals(address),
        protocolDataProvider.getReserveConfigurationData(address),
      ])

      globalReservesData[address] = {
        price,
        decimals,
        bonus: (liquidationBonus % 1000) / 100,
      }
    })
  )

  return globalReservesData
}

//Helper.sol fully supports loadV3ReservesData (add totalDebt & totalCollateral)

const compoundCache = new Map()
const loadCompoundMarketData = async (blockTag = "latest") => {
  const _provider = blockTag === "latest" ? provider : getArchiveProvider()

  const oracleContract = new Contract(ORACLE, V1OracleABI, _provider)
  const compoundContract = new Contract(PROTOCOLS_CONFIG.Compound.CONTROLLER, CompoundABI, _provider)

  const bonus =
    (await compoundContract.liquidationIncentiveMantissa({
      blockTag,
    })) /
    10 ** 18

  const markets = await compoundContract.getAllMarkets({
    blockTag,
  })
  const marketsData = {}

  await Promise.all(
    markets.map(async market => {
      const marketCache = compoundCache.get(market)

      const marketAddress = market.toLowerCase()
      const isETH = marketAddress === PROTOCOLS_CONFIG.Compound.CETH.toLowerCase()

      let collateralFactorMantissa
      if (marketCache && marketCache.collateralFactorMantissa) {
        collateralFactorMantissa = marketCache.collateralFactorMantissa
      } else {
        const res = await compoundContract.markets(market, {
          blockTag,
        })
        collateralFactorMantissa = res.collateralFactorMantissa
        compoundCache.set(market, {
          ...marketCache,
          collateralFactorMantissa,
        })
      }
      const collateralFactor = collateralFactorMantissa / 10 ** 18

      let decimals = 18
      let price = 1

      if (!isETH) {
        const marketCache = compoundCache.get(market)
        let underlying

        if (marketCache && marketCache.underlying) {
          underlying = marketCache.underlying
        } else {
          const cTokenContract = new Contract(market, CTokenABI, _provider)
          underlying = await cTokenContract.underlying({
            blockTag,
          })
          compoundCache.set(market, {
            ...marketCache,
            underlying,
          })
        }

        ;[decimals, price] = await Promise.all([
          getTokenDecimals(underlying),
          oracleContract.getAssetPrice(underlying, {
            blockTag,
          }),
        ])
      }

      marketsData[marketAddress] = {
        price,
        decimals,
        collateralFactor,
        bonus: (bonus * 100) % 100,
      }
    })
  )

  return marketsData
}

//Helper.sol fully supports loadCompoundReservesData (add totalDebt & totalCollateral)

module.exports = { loadV1ReservesData, loadV2ReservesData, loadV3ReservesData, loadCompoundMarketData }
