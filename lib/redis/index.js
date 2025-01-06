const redis = require("./redis/lib")

/**
 * Config file to the Redis namespaces
 */
const redisNamespaces = require("../../configs/redisNamespaces.js")

/**
 * Single Redis client getter
 * @returns {Promise<object>} - A promise that resolves to the Redis client instance.
 */
const getRedisClient = async () => {
  if (redis.isReady()) {
    return redis
  }
  return redis
}

/**
 * Adds a user to the blacklist
 * @param {string} user - user address
 * @param {string} protocol - V1, V2, V3...
 * @returns {Promise<boolean>} - A promise that resolves to true if the user was added
 */
const addUserToBlacklist = async (user, protocol) => {
  const redisClient = await getRedisClient()
  const userRedis = await redisClient.set(`${redisNamespaces.blacklist.namespace}:${protocol}:${user}`, {})
  return userRedis === "OK"
}

/**
 * Remove user from the blacklist
 * @param {string} user - user address
 * @param {string} protocol - V1, V2, V3...
 * @returns {Promise<boolean>} - A promise that resolves to true if the user was deleted
 */
const removeUserFromBlacklist = async (user, protocol) => {
  const redisClient = await getRedisClient()
  const userRedis = redisClient.del(`${redisNamespaces.blacklist.namespace}:${protocol}:${user}`)
  return userRedis === 1
}

/**
 * Check user exist in the blacklist
 * @param {string} user - user address
 * @param {string} protocol - V1, V2, V3...
 * @returns {Promise<boolean>} - A promise that resolves to true if the user exists in the blacklist
 */
const checkUserInBlacklist = async (user, protocol) => {
  const redisClient = await getRedisClient()
  const userRedis = await redisClient.get(`${redisNamespaces.blacklist.namespace}:${protocol}:${user}`)

  return userRedis !== null
}

/**
 * Methods with using redis SET
 */

/**
 * Add a users to the blacklist
 * @param {Array<string>} users - user addresses
 * @param {string} protocol - V1, V2, V3...
 * @returns {Promise<number>} - A promise that resolves to the number of elements that were added to the set, not including all the elements already present in the set.
 */
const addUsersToBlacklistSet = async (users, protocol) => {
  const redisClient = await getRedisClient()
  const result = await redisClient.sadd(`${redisNamespaces.globalNamespace}:${redisNamespaces.blacklist.namespace}:${protocol}`, users)
  return result
}

/**
 * Remove users from the blacklist
 * @param {string} users - user addresses
 * @param {string} protocol - V1, V2, V3...
 * @returns {Promise<number>} - A promise that resolves to the number of members that were removed from the set, not including non existing members.
 */
const removeUsersFromBlacklistSet = async (users, protocol) => {
  const redisClient = await getRedisClient()
  const result = redisClient.srem(`${redisNamespaces.globalNamespace}:${redisNamespaces.blacklist.namespace}:${protocol}`, users)
  return result
}

/**
 * Check users exists in the blacklist
 * @param {string} users - user addresses
 * @param {string} protocol - V1, V2, V3...
 * @returns {Promise<Array<number>>} - A promise that resolves to list representing the membership of the given elements, in the same order as they are requested.
 */
const checkUsersInBlacklistSet = async (users, protocol) => {
  const redisClient = await getRedisClient()
  const result = await redisClient.smismember(`${redisNamespaces.globalNamespace}:${redisNamespaces.blacklist.namespace}:${protocol}`, users)

  return result
}

/**
 * Methods for working with DataFetcher and TransmitFetcher services
 */

/**
 * Add a users to the asset + protocol fot transmit fetcher service
 * @param {Array<string>} users - user addresses
 * @param {string} protocol - V1, V2, V3...
 * @param {string} asset - asset address
 * @returns {Promise<number>} - A promise that resolves to the number of elements that were added to the set, not including all the elements already present in the set.
 */
const addUsersToDataFetcherSet = async (users, protocol, asset) => {
  const redisClient = await getRedisClient()
  const result = await redisClient.sadd(`${redisNamespaces.globalNamespace}:${redisNamespaces.dataFetcher.namespace}:${protocol}:${asset}`, users)
  return result
}

/**
 * Remove users from the asset + protocol for transmit fetcher service
 * @param {string} users - user addresses
 * @param {string} protocol - V1, V2, V3...
 * @param {string} asset - asset address
 * @returns {Promise<number>} - A promise that resolves to the number of members that were removed from the set, not including non existing members.
 */
const removeUsersFromDataFetcherSet = async (users, protocol, asset) => {
  const redisClient = await getRedisClient()
  const result = redisClient.srem(`${redisNamespaces.globalNamespace}:${redisNamespaces.dataFetcher.namespace}:${protocol}:${asset}`, users)
  return result
}

/**
 * Get users from the asset + protocol for transmit fetcher service
 * @param {string} protocol - V1, V2, V3...
 * @param {string} asset - asset address
 * @returns {Promise<number>} - A promise that resolves to the number of members that were removed from the set, not including non existing members.
 */
const getUsersFromDataFetcherSet = async (protocol, asset) => {
  const redisClient = await getRedisClient()
  const result = redisClient.smembers(`${redisNamespaces.globalNamespace}:${redisNamespaces.dataFetcher.namespace}:${protocol}:${asset}`)
  return result
}

/**
 * Methods for working with archive service
 */

/**
 * Retrieves archive data for a specific protocol and column from Redis.
 * @param {string} protocol - The protocol to retrieve data for.
 * @param {string} column - The column to retrieve data from.
 * @returns {Promise<any>} - A promise that resolves to the data stored in the specified archive column.
 */
const getArchiveData = async (protocol, column) => {
  const redisClient = await getRedisClient()
  const result = await redisClient.hget(`${redisNamespaces.archive.namespace}:${protocol}`, column)
  return result
}

/**
 * Sets archive data for a specific protocol and column in Redis.
 * @param {string} protocol - The protocol to set data for.
 * @param {string} column - The column to set data in.
 * @param {Object} data - The data to store in the specified archive column.
 * @returns {Promise<any>} - A promise that resolves to the result of the Redis hset operation.
 */
const setArchiveData = async (protocol, column, data) => {
  const redisClient = await getRedisClient()
  const result = await redisClient.hset(`${redisNamespaces.archive.namespace}:${protocol}`, column, JSON.stringify(data))
  return result
}

/**
 * Retrieves the last modification timestamp for a specific protocol from Redis.
 * @param {string} protocol - The protocol to retrieve the last modification timestamp for.
 * @returns {Promise<string>} - A promise that resolves to the timestamp of the last modification.
 */
const getLastModifyKey = async protocol => {
  const redisClient = await getRedisClient()
  const result = await redisClient.get(`${redisNamespaces.archive.lastModify}:${protocol}`)
  return result
}

/**
 * Sets the last modification timestamp for a specific protocol in Redis.
 * @param {string} protocol - The protocol to set the last modification timestamp for.
 * @param {string} date - The timestamp to set as the last modification time.
 * @returns {Promise<any>} - A promise that resolves to the result of the Redis set operation.
 */
const setLastModifyKey = async (protocol, date) => {
  const redisClient = await getRedisClient()
  const result = await redisClient.set(`${redisNamespaces.archive.lastModify}:${protocol}`, date)
  return result
}

module.exports = getRedisClient

module.exports = {
  getRedisClient,
  addUserToBlacklist,
  removeUserFromBlacklist,
  checkUserInBlacklist,
  addUsersToBlacklistSet,
  removeUsersFromBlacklistSet,
  checkUsersInBlacklistSet,
  addUsersToDataFetcherSet,
  removeUsersFromDataFetcherSet,
  getUsersFromDataFetcherSet,
  getArchiveData,
  setArchiveData,
  getLastModifyKey,
  setLastModifyKey,
}
