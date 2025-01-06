"use strict"
const { fork } = require("node:child_process")
const { createRegister } = require("./register")
const mq = require("./mq")

/**
 * Keep alive processes
 */
let restart = true

/**
 * Service name
 */
const name = process.argv[2]

/**
 * Service params
 */

const params = JSON.parse(process.argv[3])

/**
 * Debug mode
 */
const debug = process.argv[4]

/**
 * Child process references
 */
const processes = createRegister()

/**
 * Send event by roundrobing
 * @param {string} ev - event name
 * @param {*} message - message
 */
const rr = (ev, message) => {
  const { process } = processes.next()
  process.send({ type: ev, message })
}

/**
 * Broadcast event for all
 * @param {*} ev - event name
 * @param {*} message - message
 */
const broadcast = (ev, message) => {
  for (const { process } of processes.all) process.send({ type: ev, message })
}

/**
 * Subscribe for mqtt
 * @param {*} listen - struct contains topics and events
 */
const subs = listen => {
  for (const ev in listen) {
    const { topic, roundrobing } = listen[ev]
    mq.subscribe(topic, message => {
      if (roundrobing) rr(ev, message)
      else broadcast(ev, message)
    })
  }
}

/**
 * When subprocess start
 * @param {number} pid - process id
 */
const onStart = pid => {
  mq.sendEvent(name, "start", { pid })
}

/**
 * When subprocess ready to stop
 * @param {number} pid - process id
 */
const onStop = pid => {
  const p = processes.remove(pid)
  if (p.process) p.process.kill()
  mq.sendEvent(name, "stop", { pid })
  if (processes.all.length === 0) {
    setTimeout(() => {
      process.exit(0)
    }, 100)
  }
}

/**
 * When subprocess send message
 * @param {number} pid - process id
 * @param {*} msg - message
 */
const onMessage = (pid, msg) => {
  const { type, message } = msg
  if (type === "error") return onError(pid, message)
  if (type === "warn") return onWarn(pid, message)
  if (type === "stop") return onStop(pid, message)
  const { notify } = params
  if (!notify) return
  const { topic } = notify[type]
  mq.notify(topic, message)
}

/**
 * When error happens in subprocess
 * @param {number} pid - process id
 * @param {*} error - Error
 */
const onError = (pid, message) => {
  const { process } = processes.remove(pid)
  console.error(message)
  if (process) process.kill()
  mq.sendEvent(name, "error", { pid, message })
}

/**
 * When warn happens in subprocess
 * @param {number} pid - process id
 * @param {*} msg - warmn message
 */
const onWarn = (pid, message) => {
  mq.sendEvent(name, "warn", { pid, message })
}

/**
 * When subprocess closes
 * @param {number} pid - process id
 */
const onClose = pid => {
  processes.remove(pid)
  if (restart) startProcess(name, params)
  mq.sendEvent(name, "close", { pid })
}

/**
 * Start child process
 * @param {String} name - services name
 * @param {*} params - service params
 * @returns { pid, process }
 */
const startProcess = (name, params) => {
  const p = JSON.stringify(params)
  const path = `${__dirname}/process.js`
  const process = fork(path, [name, p, debug])
  const { pid } = process
  processes.add(pid, process)
  process.on("close", () => onClose(pid))
  process.on("error", error => onError(pid, error))
  process.on("message", m => onMessage(pid, m))
  onStart(pid)
  return { pid, process }
}

/**
 * Start cluster
 * @param {string} name - services name
 * @param {*} params - service sparams
 */
const startCLuster = async (name, params) => {
  const { forks } = params
  for (let i = 0; i < forks; i++) startProcess(name, params)
  const { listen } = params
  if (listen) subs(listen)
}

/**
 * Catch and report cluster errors
 */
process.on("uncaughtException", error => {
  console.error(error)
  const message = error.message || "Undefined"
  mq.sendEvent(name, "cluster-error", { message })
  setTimeout(() => {
    process.exit(1)
  }, 300)
})

/**
 * Get SIGINT signal
 */
process.on("SIGINT", () => {
  restart = false
  broadcast("stop", {})
})

/**
 * Stop service by mqtt command
 */
mq.onCommand(name, msg => {
  const { type } = msg
  if (type === "stop") {
    restart = false
    broadcast("stop", {})
  }
})

/**
 * Start cluster
 */
startCLuster(name, params)
