const { WatcherReserves } = require("./watcher-reserves")
const { WatcherReservesV1 } = require("./watcher-reserves-aave-v1")
const { WatcherReservesV2 } = require("./watcher-reserves-aave-v2")
const { WatcherReservesV3 } = require("./watcher-reserves-aave-v3")
const { WatcherReservesCompound } = require("./watcher-reserves-compound")
const { WatcherReservesLiquity } = require("./watcher-liquity")
const { WatcherReservesMakerDao } = require("./watcher-reserves-maker-dao")

/**
 * Factories
 * @param {*} config - all configs settings from Main.json
 * @returns {WatcherReserves}
 */
const createWatcherV1 = config => new WatcherReservesV1(config)
const createWatcherV2 = config => new WatcherReservesV2(config)
const createWatcherV3 = config => new WatcherReservesV3(config)
const createWatcherCompound = config => new WatcherReservesCompound(config)
const createWatcherLiquity = config => new WatcherReservesLiquity(config)
const createWatcherMakerDao = config => new WatcherReservesMakerDao(config)

module.exports = {
  WatcherReserves,
  WatcherReservesV1,
  WatcherReservesV2,
  WatcherReservesV3,
  WatcherReservesCompound,
  WatcherReservesLiquity,
  WatcherReservesMakerDao,
  createWatcherV1,
  createWatcherV2,
  createWatcherV3,
  createWatcherCompound,
  createWatcherLiquity,
  createWatcherMakerDao,
}
