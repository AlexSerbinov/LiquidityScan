"use strict"

/**
 * Get system config
 */
let conf
const getConfig = () => {
  if (conf) return conf
  const cwd = process.cwd()
  conf = require(`${cwd}/sys.config.json`)
  return conf
}

module.exports = { getConfig }
