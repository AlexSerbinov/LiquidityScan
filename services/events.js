const { configurePool } = require("../lib/ethers/pool")

const { createBlockWatcher } = require("../lib/services/events/watcher-block")
const { createWatcherV1, createWatcherV2, createWatcherV3, createWatcherCompound, createWatcherLiquity, createWatcherMakerDao } = require("../lib/services/events/reserves/watcher-reserves-factory")
const { EventEmitter } = require("node:events")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { START, STOP, INFO, ERROR_MESSAGE } = require("../configs/loggerTopicsConstants")

/**
 * @param {string} configPath - Path to the configuration file Main.json, that contains necessary filters and parameters for the service.
 * This file includes configurations such as database connections, service endpoints, and other operational parameters.
 *
 * @param {string} service - The name of the service (e.g., "subgraph", "dataFetcher", "transmitFetcher" "proxy", "archive", "blacklist", etc.)
 *
 * @param {string} mode - The protocol used for network communication: 'http', 'https', 'ws', or 'wss'.
 * This defines how the service will connect to provider for getting new block
 *
 * @param {number} GET_BLOCK_NUMBER_HTTP_INTERVAL - The general polling interval (in milliseconds) for the provider.getBlockNumber().
 * NOTE: used only when mode http or https
 *
 * @param {number} WATCHER_RESERVES_INTERVAL - The time interval (in milliseconds) for the reserves watcher to trigger.
 * It defines how frequently the service should check or update reserves related data.
 */
const { configPath, service, WATCHER_RESERVES_INTERVAL, GET_BLOCK_NUMBER_HTTP_INTERVAL, mode } = $.params

/**
 * Load the configuration Main.json file
 */
const config = require(`${process.cwd()}${configPath}`)
/**
 * Initiating the connection to the Ethereum node
 */
configurePool([config.RPC_WSS])

/**
 * Block watcher
 */
const blockWatcher = createBlockWatcher()
  .onBlock(number => {
    $.send("sendBlock", { number, chain: "eth" })
    sendInfoEvent("sendBlock", number)
  })
  .onError(e => sendErrorEvent(e))

/**
 * Reserves watcher
 */
const reservesV1 = createWatcherV1(config)
  .onReserves(data => {
    $.send("sendGlobalReservesV1", data)
  })
  .onError(e => sendErrorEvent(e, "V1"))

const reservesV2 = createWatcherV2(config)
  .onReserves(data => {
    $.send("sendGlobalReservesV2", data)
  })
  .onError(e => sendErrorEvent(e, "V2"))

const reservesV3 = createWatcherV3(config)
  .onReserves(data => {
    $.send("sendGlobalReservesV3", data)
  })
  .onError(e => sendErrorEvent(e, "V3"))

const reservesCompound = createWatcherCompound(config)
  .onReserves(data => {
    $.send("sendGlobalReservesCompound", data)
  })
  .onError(e => sendErrorEvent(e, "Compound"))

const watcherLiquity = createWatcherLiquity(config)
  .onReserves(data => {
    $.send("sendGlobalReservesLiquity", data)
  })
  .onError(e => sendErrorEvent(e, "Liquity"))

const watcherMakerDao = createWatcherMakerDao(config)
  .onReserves(data => {
    $.send("sendGlobalReservesMakerDAO_CDP", data)
  })
  .onError(e => sendErrorEvent(e, "MakerDAO_CDP"))

/**
 * Reserves watcher trigger
 */
const reservesTrigger = new EventEmitter()

/**
 * Start app
 */
const start = async mode => {
  /**
   * Emit 'update' event to reserves trigger by interval
   */
  setInterval(() => {
    reservesTrigger.emit("update")
  }, WATCHER_RESERVES_INTERVAL)

  /**
   * Start block watcher
   */
  blockWatcher.start(mode, GET_BLOCK_NUMBER_HTTP_INTERVAL)

  /**
   * Start reserves watchers
   */
  reservesV1.start(reservesTrigger)
  reservesV2.start(reservesTrigger)
  reservesV3.start(reservesTrigger)
  reservesCompound.start(reservesTrigger)
  watcherLiquity.start(reservesTrigger)
  watcherMakerDao.start(reservesTrigger)
  $.send("start", {
    service,
    protocol: "All",
    ev: START,
    data: "All event watchers started",
  })
}
start(mode)

/**
 * Stop app
 */
const stop = () => {
  blockWatcher.stop()
  reservesV1.stop()
  reservesV2.stop()
  reservesV3.stop()
  reservesCompound.stop()
  sendStopEvent(STOP, "All event watchers stopped")
}

module.exports = { start, stop }

/**
 * Handle process exit
 */
$.onExit(async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { pid } = process
      stop()
      console.log(pid, "Ready to exit.")
      const date = new Date().toUTCString()
      sendStopEvent(STOP, date)
      resolve()
    }, 150) // Small timeout to ensure async cleanup completes
  })
})

const sendErrorEvent = (error, protocol = "All") => {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: error,
  })
}

const sendInfoEvent = (ev = INFO, info) => {
  $.send("info", {
    service,
    protocol: "All",
    ev,
    data: info,
  })
}

const sendStopEvent = (ev = STOP, info) => {
  $.send("stop", {
    service,
    protocol: "All",
    ev,
    data: info,
  })
}
// Handle uncaught exceptions
process.on("uncaughtException", error => {
  $.send("errorMessage", {
    service,
    protocol: "All",
    ev: ERROR_MESSAGE,
    data: error,
  })
})

/**
 * Handle process exit
 */
$.onExit(async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { pid } = process
      console.log(pid, "Ready to exit.")
      const date = new Date().toUTCString()
      sendStopEvent(STOP, date)
      resolve()
    }, 100) // Small timeout to ensure async cleanup completes
  })
})
