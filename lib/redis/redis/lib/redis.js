const Redis = require("ioredis")
const assert = require("node:assert/strict")

/**
 * Redis client.
 */
let client

/**
 * Connection state
 */
let isClientReady = false

/**
 * Check is client ready
 * @returns {boolean} - true if ready
 */
const isReady = () => isClientReady

/**
 * Convert an object to a JSON string.
 * @param {Object} obj - The object to convert.
 * @returns {string} - The JSON string representation of the object.
 */
const stringify = obj => {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.error(`Error in stringify: ${error}`)
    return null
  }
}

/**
 * Convert a JSON string to an object.
 * @param {string} str - The JSON string to convert.
 * @returns {Object|null} - The object parsed from the JSON string or null if parsing fails.
 */
const parse = str => {
  try {
    return JSON.parse(str)
  } catch (_) {
    return str
  }
}

/**
 * Add a value to a Redis.
 * @param {string} key - The Redis key.
 * @param {Object|string|number} value - The value to add.
 * @returns {Promise<string>} - A promise that resolves to the element added ('OK')
 */
const set = async (key, value) => {
  assert(typeof key === "string", "Key must be a string")

  const stringValue = typeof value === "object" ? stringify(value) : value
  return await client.set(key, stringValue)
}

/**
 * Check if a value exist in redis
 * @param {string} key - The Redis key.
 * @returns {Promise<any>} - A promise that resolves to the value associated with the Redis key.
 */
const get = async key => {
  assert(typeof key === "string", "Key must be a string")

  const result = await client.get(key)

  return parse(result)
}

/**
 * Remove a value from a Redis by key.
 * @param {string} key - The Redis key.
 * @param {Object|string|number} value - The value to remove.
 * @returns {Promise<number>} - A promise that resolves to the number of elements removed (0 or 1).
 */
const del = async key => {
  assert(typeof key === "string", "Key must be a string")

  const result = await client.del(key)
  return result
}

/**
 * Add a member to a Redis set.
 * @param {string} key - The Redis key.
 * @param {Array<Object|string|number>} members - The members to add.
 * @returns {Promise<number>} - A promise that resolves to the number of elements added to the set.
 */
const sadd = async (key, members) => {
  assert(typeof key === "string", "Key must be a string")

  const stringMembers = members.map(member => {
    return typeof member === "object" ? stringify(member) : member
  })

  const result = await client.sadd(key, stringMembers)
  return result
}

/**
 * Returns all the members of the set value stored at key.
 * @param {string} key - The Redis key.
 * @returns {Promise<array>} - A promise that resolves to array of set members
 */
const smembers = async key => {
  assert(typeof key === "string", "Key must be a string")

  const result = await client.smembers(key)
  return result
}

/**
 * Returns count of members of the set.
 * @param {string} key - The Redis key.
 * @returns {Promise<number>} - A promise that resolves to number
 */
const scard = async key => {
  assert(typeof key === "string", "Key must be a string")

  const result = await client.scard(key)
  return result
}

/**
 * Check if a members is in a Redis set.
 * @param {string} key - The Redis key.
 * @param {Object|string|number} members - The array of members to check.
 * @returns {Promise<array>} - A promise that resolves to array [1,0...] if the members is in the set
 */
const smismember = async (key, members) => {
  assert(typeof key === "string", "Key must be a string")

  const stringMembers = members.map(member => {
    return typeof member === "object" ? stringify(member) : member
  })
  const result = await client.smismember(key, stringMembers)
  return result
}

/**
 * Remove one or more members from a Redis set.
 * @param {string} key - The Redis key.
 * @param {Object|string|number} members - The array of members to remove.
 * @returns {Promise<number>} - A promise that resolves to the number of elements removed from the set.
 */
const srem = async (key, members) => {
  assert(typeof key === "string", "Key must be a string")

  const stringMembers = members.map(member => {
    return typeof member === "object" ? stringify(member) : member
  })

  const result = await client.srem(key, stringMembers)
  return result
}

/**
 * Retrieve a value from a hash stored at a key in Redis.
 * @param {string} key - The key at which the hash is stored.
 * @param {string} field - The field for which to get the value in the hash.
 * @returns {Promise<any>} - A promise that resolves with the value of the field in the hash.
 * If the field is not found, it resolves to null.
 */
const hget = async (key, field) => {
  assert(typeof key === "string", "Key must be a string")
  assert(typeof field === "string", "Field must be a string")
  const result = await client.hget(key, field)
  return parse(result)
}


/**
 * Set a value in a hash stored at a key in Redis.
 * @param {string} key - The key at which the hash is stored.
 * @param {string} field - The field within the hash to set the value.
 * @param {Object|string|number} value - The value to set at the specified field in the hash.
 * @returns {Promise<string>} - A promise that resolves with 'OK' if the field is successfully set.
 */
const hset = async (key, field, value) => {
  assert(typeof key === "string", "Key must be a string");
  assert(typeof field === "string", "Field must be a string");
  const stringValue = typeof value === "object" ? stringify(value) : value;
  return await client.hset(key, field, stringValue);
};

/**
 * Prepare Redis client.
 * @param {string} host - Redis host.
 * @param {number} port - Redis port.
 * @returns {Promise<void>} - A promise that resolves when the connection is ready.
 */
const prepare = async (host = "localhost", port = 6379) => {
  client = new Redis({
    port,
    host,
  })
  isClientReady = true
}

const end = async () => {
  await client.disconnect()

  isClientReady = false
}

module.exports = {
  set,
  get,
  del,
  sadd,
  smismember,
  srem,
  smembers,
  scard,
  hget,
  hset,
  prepare,
  isReady,
  end,
}
