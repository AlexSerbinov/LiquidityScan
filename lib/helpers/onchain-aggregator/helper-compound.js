"use strict"
const { HelperBase } = require("./helper-base")
const { BigNumber } = require("ethers")
const { formatUsersReserves, formatCompoundGlobalReserves } = require("./utils")

class HelperCompound extends HelperBase {
  /**
   * Construct a new HelperV1 instance
   * @param {Provider} provider - ethers/Provider
   */
  constructor(provider, config) {
    super(provider, config)
    this.globalReserves = null
  }

  /**
   * Get global reserves data from the Aave V1 pool
   */
  async getGlobalReserves() {
    return this.contract.compoundGetGlobalReservesData().then(formatCompoundGlobalReserves)
  }

  /**
   * Set global reserves for getUsersReserves temp
   */
  async setGlobalReserves(globalReserves) {
    this.globalReserves = globalReserves
  }

  /**
   * Get users reserves data from the Aave V1 pool
   * @param {Array} users - Array of user addresses
   */
  async getUsersReserves(users) {
    if (!this.globalReserves) {
      throw new Error(`You can not using getUsersReserves without setGlobalReserves for HelperCompound`)
    }

    const usersDataRaw = await this.contract.compoundGetUsersData(users).then(formatUsersReserves)

    const dec18 = 10 ** 18

    const usersData = usersDataRaw.map(user => {
      let totalCollateralETH = 0,
        totalBorrowsETH = 0,
        totalCollateralFactor = 0
      Object.keys(user.reserves).forEach(reserve => {
        try {
          const { borrowBalance, collateralBalance } = user.reserves[reserve]
          const reserves = this.globalReserves[reserve]
          const price = BigNumber.from(reserves.price)
          const decimals = BigNumber.from(reserves.decimals)
          const collateralFactor = BigNumber.from(reserves.collateralFactor)
          const priceETH = price !== 1 ? price / dec18 : price
          const decReserve = 10 ** decimals

          const collateralInETH = priceETH === 1 ? collateralBalance / decReserve : (collateralBalance / decReserve) * priceETH
          const debtInETH = (borrowBalance / decReserve) * priceETH

          const collateralFactorInETH = (collateralFactor / dec18) * collateralInETH

          totalCollateralETH += collateralInETH
          totalBorrowsETH += debtInETH
          totalCollateralFactor += collateralFactorInETH
        } catch (error) {}
      })

      let healthFactor = 0
      if (totalBorrowsETH) {
        healthFactor = (totalCollateralFactor / totalBorrowsETH) * dec18
      }

      return {
        ...user,
        healthFactor,
        totalCollateralETH: totalCollateralETH * dec18,
        totalBorrowsETH: totalBorrowsETH * dec18,
      }
    })

    return usersData
  }

  /**
   * Method to get a specific user's reserves
   * @param {string} user - User address
   */
  async getUserReserves(user) {
    return this.getUsersReserves([user]).then(res => res[0])
  }
}

module.exports = { HelperCompound }
