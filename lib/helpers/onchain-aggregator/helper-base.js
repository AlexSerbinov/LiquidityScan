"use strict"
const { Contract, Wallet } = require("ethers")
const helperABI = require("../../artifacts/aave-compound-helper/Helper")

class HelperBase {
  /**
   * Construct a new HelperBase instance
   * @param {Provider} provider - ethers/Provider
   */
  constructor(provider, config) {    
    const signer = new Wallet(config.SIGNER_HELPER)
    this.contract = new Contract(config.HELPER, helperABI, signer.connect(provider))
  }

  /**
   * Abstract method to get global reserves
   */
  async getGlobalReserves() {
    throw new Error("Method not implemented.")
  }

  /**
   * Abstract method to get user's reserves
   * @param {Array} users - Array of user addresses
   */
  async getUsersReserves(users) {
    throw new Error("Method not implemented.")
  }

  /**
   * Method to get a specific user's reserves
   * @param {string} user - User address
   */
  async getUserReserves(user) {
    return this.getUsersReserves([user]).then(res => res[0])
  }
}

module.exports = { HelperBase }
