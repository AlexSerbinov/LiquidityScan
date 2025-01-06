"use strict"

const { providers } = require("ethers")
const { WebSocketProvider } = providers

const assert = require("node:assert/strict")


let pool

/**
 * ethers:WebSocketProvider
 * current provider
 */
let provider

/**
 * Need to update (or not)
 */
let update = true

/**
 * Set up pool (once only)
 * @param {[string]} providers - array of providers url's
 */
const configurePool = providers => {
  if (pool) return
  pool = createPool(WebSocketProvider)
  for (const url of providers) pool.addUrl(url)
}

/**
 * Refresh current provider
 * @returns {WebSocketProvider}
 */
const updateProvider = () => {
  const p = pool.nextProvider()
  p.on("error", () => (update = true))
  p.on("block", () => (update = true))
  pool.releaseProvider(provider)
  provider = p
  update = false
  return provider
}

/**
 * Get ethers provider
 * @returns {WebSocketProvider}
 */
const getProvider = () => {
  assert(pool, "Pool is not configurate, call configurePool() first.")
  if (!update) return provider
  return updateProvider()
}

module.exports = { configurePool, getProvider }
