"use strict"
const { HelperBase } = require("./helper-base")
const { formatAaveGlobalReserves, formatUsersReserves } = require("./utils")

class HelperV3 extends HelperBase {
  /**
   * Construct a new HelperV3 instance
   * @param {Provider} provider - ethers/Provider
   */
  constructor(provider, config) {
    super(provider, config)
  }

  /**
   * Get global reserves data from the Aave V1 pool
   */
  async getGlobalReserves() {
    return this.contract.aaveV3GetGlobalReservesData().then(formatAaveGlobalReserves)
  }

  /**
   * Get users reserves data from the Aave V1 pool
   * @param {Array} users - Array of user addresses
   */
  async getUsersReserves(users) {
    return this.contract.aaveV3GetUsersData(users).then(formatUsersReserves)
  }
}

module.exports = { HelperV3 }
