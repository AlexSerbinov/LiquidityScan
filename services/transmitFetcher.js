const { createTransmitFetcher } = require("../lib/services/transmit/fetchers/fetcher-factory")
const { configurePool } = require("../lib/ethers/pool")
const redis = require("../lib/redis/redis/lib/redis")
const { createSimulator } = require("../lib/simulator")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { START, STOP, INFO, LIQUIDATE_EVENT, SIMULATIONS_STARTED, INPUT_TRANSMIT, ERROR_MESSAGE } = require("../configs/loggerTopicsConstants")
/**
 * @param {*} filters - The filters object containing the following properties:
 *  - mode: The mode of operation (e.g. "fetch")
 *  - min_collateral_amount: The minimum collateral amount
 *  - min_borrow_amount: The minimum borrow amount
 *  - min_health_factor: The minimum health factor
 *  - max_health_factor: The maximum health factor
 *  - update_time: The update time in seconds
 *
 * @param {string} protocol - The name of the lending protocol (e.g., "V1", "V2", "V3" "Compound")
 *
 * @param {string} configPath - Path to the configuration file Main.json, that contains necessary filters and parameters for the service.
 * This file includes configurations such as database connections, service endpoints, and other operational parameters.
 *
 * @param {string} service - The name of the service (e.g., "subgraph", "dataFetcher", "transmitFetcher" "proxy", "archive", "blacklist", etc.)
 *
 * @param {Function} formattedTrace - A function used in the simulator to format the formattedTrace log. It displays every
 * call between the smart contract, including call, delegate call, etc., providing a complete breakdown of interactions.
 *
 * @param {string} stateOverrides - The bytecode of the smart contract used for simulation. This is utilized
 * to fetch user data using the simulator, effectively representing the bytecode of our smart contract.
 *
 * @param {string} enso_url - The url to enso simulator
 *
 * @param {number} maxNumberOfUsersToSimulate - The maximum number of users for parallel simulation.
 * Be careful when using numbers greater than 40 due to gas limit restrictions.
 * Try to find the optimal number, the more the better until an error occurs.
 */
const { protocol, configPath, filters, service, formattedTrace, stateOverrides, enso_url } = $.params

/**
 * Now we save the path for config params for each protocol in [serviceName]service.json file.
 */
const config = require(`${process.cwd()}${configPath}`)

/**
 * Initiating the connection to the Ethereum node
 */
configurePool([config.RPC_WSS])

/**
 * We prepare redis here because only in this place we have config params. And we don't want to use global variables.
 */
await redis.prepare(config.REDIS_HOST, config.REDIS_PORT)

/**
 * Interface for enso simulator
 */
const simulator = createSimulator(enso_url, formattedTrace, stateOverrides)

/**
 * Create transmit fetcher. The main filtering logic
 */
const fetcher = createTransmitFetcher($.params, filters, config, simulator)

$.send("start", {
  service,
  protocol,
  ev: START,
  data: { date: new Date().toUTCString() },
})
console.log(`TransmitFetcher started ${protocol}`)

/**
 * input point
 */
$.on("transmit", async data => {
  try {
    if (!data.transaction) {
      return // if no transaction hash, skip
    }
    const fullTransactionDetails = data.fullTxData
    if (!data.decoded.configs.some(config => config.protocols && config.protocols.includes(protocol))) {
      return // skip if no assets for this protocol
    }
    fetcher.emit("info", data, INPUT_TRANSMIT)
    // check if transmit assets have current protocol
    const assets = data.decoded.configs.filter(config => config.protocols && config.protocols.includes(protocol)).map(config => config.token)
    const usersByAssets = await fetcher.getUsersByAsset(assets)
    if (usersByAssets.length == 0) {
      return
    }
    fetcher.emit("info", `Simulations started`, SIMULATIONS_STARTED)
    usersByAssets.forEach((user, index) => {
      fetcher.request(user, fullTransactionDetails, index + 1 == usersByAssets.length)
    })
  } catch (error) {
    console.error(error)
    fetcher.emit("errorMessage", error)
  }
})

/**
 * Main output point.
 * Send liquidate event to the Liquidator service
 * And log to the logger server
 */
fetcher.on("liquidate", data => {
  $.send("liquidateCommand", data)
  fetcher.emit("info", data.resp, LIQUIDATE_EVENT)
})

/**
 * Set grobal reserves data
 */
$.on(`onReservesData`, data => {
  fetcher.setGlobalReservesData(data)
})

/**
 * Used for sending logs from other parts of the protocol to the logger server
 * Main logger handler, use this instead of this.emit("info", data) directly
 */
fetcher.on("info", (data, ev = INFO) => {
  $.send("info", {
    service,
    protocol,
    ev,
    data: JSON.stringify(data),
  })
})

/**
 * Used for sending logs from other parts of the protocol to the logger server
 * Main logger handler, use this instead of this.emit("errorMessage", data) directly
 */
fetcher.on("errorMessage", data => {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: JSON.stringify(data),
  })
})

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: error,
  })
})

/**
 * Handle process exit
 * If you need to perform some cleanup before the process exits, add this functionale here
 */
$.onExit(async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { pid } = process
      console.log(pid, "Ready to exit.")
      const date = new Date().toUTCString()
      $.send("stop", {
        service,
        protocol,
        ev: STOP,
        data: date,
      })
      resolve()
    }, 100) // Small timeout to ensure async cleanup completes
  })
})
