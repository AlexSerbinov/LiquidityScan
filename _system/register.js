"use strict"

/**
 * Register for running processes
 */
class Register {
  constructor() {
    this.processes = []
    this.pids = new Set()
    this.index = 0
  }

  /**
   * Get all processes
   */
  get all() {
    return this.processes
  }

  /**
   * Add new process
   * @param {number} pid - process id
   * @param {ChildProcess} process - cp instance
   * @returns {Register}
   */
  add(pid, process) {
    this.processes.push({ pid, process })
    this.pids.add(pid)
    return this
  }

  /**
   * Remove process by pid
   * @param {number} pid - process id
   * @returns { pid, process } - removed instance
   */
  remove(pid) {
    if (!this.pids.has(pid)) return {}
    let removed
    this.processes = this.processes.filter(el => {
      if (el.pid !== pid) return true
      removed = el
      return false
    })
    this.pids.delete(pid)
    return removed
  }

  /**
   * Get next process for round robing
   * @returns { pid, process }
   */
  next() {
    const { processes, index } = this
    const process = processes[index]
    if (index >= processes.length - 1) this.index = 0
    else this.index++
    return process
  }
}

/**
 * Default factory
 * @returns {Register}
 */
const createRegister = () => new Register()

module.exports = { createRegister, Register }
