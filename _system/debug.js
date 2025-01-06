"use strict"
Error.stackTraceLimit = 100 // When debug is on - show 100 lines of error stack trace instead of default 10
const { getConfig } = require("./config")

/**
 * System config
 */
const sysConf = getConfig()

/**
 * Services name to debug
 */
const name = process.argv[3]

/*
 * Services config json path
 */
const confP = process.argv[2]
const conf = require(`${process.cwd()}/${confP}`)

/**
 * Merge the default settings with specific service settings.
 * @param {Object} defaults - The default settings.
 * @param {Object} specific - The specific settings for a service.
 * @returns {Object} The result of merging the two settings objects.
 */
const mergeSettings = (defaults, specific) => {
  const merge = (target, source) => {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        target[key] = merge(target[key] || {}, source[key])
      } else {
        target[key] = source[key]
      }
    })
    return target
  }

  const combined = merge(defaults, specific)
  if (specific.script) {
    combined.script = specific.script
  } else if (defaults.script) {
    combined.script = defaults.script
  }

  return combined
}

const defaultSettings = conf.DefaultSettings || {}
const serviceSettings = conf[name]
const combinedSettings = mergeSettings(defaultSettings, serviceSettings)

/**
 * Start service as node fork
 * @param {string} name - service name
 * @param {string} params - service params
 * @returns child process
 */
const node = (name, params) => {
  const debug = true

  process.argv[2] = name
  process.argv[3] = JSON.stringify(params)
  process.argv[4] = debug
  require(`${__dirname}/cluster.js`)
}

/**
 * Outputs
 */
console.log(`*** DEBUGING SERVICE ${name} WITH CONFIG: *** \n`)
console.log(`-- system:`)
console.dir(sysConf)
console.log(`-- service:`)
console.dir(combinedSettings)
console.log("\n************************************\n")
console.log(`\n*** WATCH SYSTEM STATE THROUGH MQTT ***\n`)
console.log(`mqtt sub -h '${sysConf.mq.host.split("//")[1]}' -t '${sysConf.mq.topics.stats}'`)
console.log("\n************************************\n")

/**
 * Start service
 */
node(name, combinedSettings)

/**
 * SIGINT
 */
process.on("SIGINT", () => process.exit(0))
