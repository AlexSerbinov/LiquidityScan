"use strict"
const { exec } = require("node:child_process")
const { getConfig } = require("./config")

/**
 * Sleep between starting pm2 exec
 * @param {*} ms
 * @returns
 */
const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/**
 * Run service with PM2
 * @param {string} name - Service name to start
 * @param {string} namespace - Namespace for the service
 * @param {string} params - JSON stringified parameters for the service
  * @returns
 */
const runService = async (name, namespace, params) => {
  console.log(`Starting: ${name} | ${namespace}`)
  const process = exec(`pm2 --name ${name} --namespace ${namespace} --time start ` + `${__dirname}/cluster.js -- '${name}' '${params}'`)
  await sleep(700)
  return process
}

/**
 * Merge default settings with specific service settings
 * @param {Object} defaults - Default settings object
 * @param {Object} specific - Specific settings for a protocol
 * @returns {Object} Merged settings object
 */
const mergeSettings = (defaults, specific) => {
  const merge = (target, source) => {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === "object") {
        target[key] = merge(target[key] || {}, source[key])
      } else {
        target[key] = source[key]
      }
    })
    return target
  }

  return merge(defaults, specific)
}

/**
 * Main function to start the cluster with given configuration
 * @param {string} confP - Path to config file
 */
const start = async confP => {
  const config = getConfig()
  if (!config) throw new Error("No config.")
  console.log("*** STARTING CLUSTER WITH CONFIG *** \n")
  console.dir(config)
  console.log("\n************************************\n")

  const cwd = process.cwd()
  const conf = require(`${cwd}/${confP}`)
  const defaultSettings = conf.DefaultSettings || {}
  
  for (const serviceName in conf) {
    if (serviceName === "DefaultSettings") continue

    const specificSettings = conf[serviceName]
    const combinedSettings = mergeSettings(defaultSettings, specificSettings)
    combinedSettings.name = serviceName  

    const { namespace } = combinedSettings
    const params = JSON.stringify(combinedSettings)
    await runService(serviceName, namespace, params)
  }

  console.log(`\n*** WATCH SYSTEM STATE THROUGH MQTT ***\n`)
  console.log(`mqtt sub -h '${config.mq.host.split("//")[1]}' -t '${config.mq.topics.stats}'`)
  console.log("\n************************************\n")
}
/**
 * Services config json path
 */
const conf = process.argv[2]

/**
 * Entry point
 */
start(conf)

/**
 * SIGINT
 */
process.on("SIGINT", () => process.exit(0))
