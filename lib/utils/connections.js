const { getProvider } = require("../ethers/pool")
const { pm2log } = require("../helpers/logger")

module.exports = {
  async checkNodeConnection() {
    try {
      const provider = getProvider()
      const lastBlock = await provider.getBlockNumber()
      pm2log({ message: `Node is live! block number: ${lastBlock}` })
      return true
    } catch (e) {
      pm2log({ message: `Node is unreachable!`, e })
      return false
    }
  },
}
