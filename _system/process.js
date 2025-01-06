"use strict"
const vm = require("node:vm")
const { readFile } = require("node:fs/promises")
const { createBridge, send } = require("./bridge")

/**
 * Service name
 */
const name = process.argv[2]

/**
 * Service params
 */
const params = JSON.parse(process.argv[3])

/**
 * Debug mode true/false
 */
const debug = process.argv[4]

/**
 * work directory
 */
const cwd = process.cwd()

/**
 * Bridge to communicate with virtual code
 */
const $ = createBridge(name, params)

/**
 * Send messages from VM to cluster
 */
$.on(send, msg => {
  process.send(msg)
})

/**
 * Do something before stop
 */
const finalize = async () => {
  await $.finalize()
  const type = "stop"
  process.send({ type })
}

/**
 * Get messages from cluster
 */
process.on("message", msg => {
  const { type, message } = msg
  if (type === "stop") return finalize()
  $.emit(type, message)
})

/**
 * Catch errors
 */
process.on("uncaughtException", error => {
  console.error(error)
  const message = error.message || "Undefined"
  const type = "warn"
  process.send({ type, message })
})

/**
 * Code tenplate to hide system values
 */
const clean =
  "const name = undefined;" + "const params = undefined;" + "const runVm = undefined;" + "const init = undefined;" + "const clean = undefined;"

/**
 * Init and start VM
 * @param {string} script - script path
 * @returns {Function} - service entry function
 */
const runVm = async script => {
  const src = await readFile(`${cwd}/${script}`)
  const wrapped = `async (__filename, __dirname, module, exports, require, $) => {${clean}{${src}}}`
  const virtual = new vm.Script(wrapped)
  return virtual.runInThisContext()
}

/**
 * Entry point
 * @param {string} name - service name
 * @param {*} params - service params
 */
const init = async () => {
  const { script } = params
  const fn = await runVm(script)
  fn(`${cwd}/${script}`, cwd, module, exports, require, $)
}
init()
