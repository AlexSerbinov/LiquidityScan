const { Contract } = require("ethers")
const { Fetcher } = require("./fetcher")
const compoundControllerAbi = require("../../../artifacts/compound/ControllerABI")
const { PROTOCOLS_CONFIG } = require("../../../constants")

class FetcherCompound extends Fetcher {
  constructor(protocol) {
    super(protocol)

    this.pool = new Contract(PROTOCOLS_CONFIG.Compound.CONTROLLER, compoundControllerAbi, this.provider)
  }

  /**
   * Too make proccess efficient we need to splice the whole range of few millions block to a 10000 blocks per iteration.
   * This is also going to help us in case service is corrupted by any reason - save last checkpoint to proceed from.
   *
   * Filter all block logs to find events: "borrow", "borrow on behalf of"
   *
   * @param {*} latestRedisBlock - latest (highest) blocknumber that was proccessed in Redis/PSQL/etc
   * @param {*} latestBlock - latest blocknumber from provider
   */

  async start(latestRedisBlock, latestBlock) {
    this.inProgress = true
    const fromBlock = latestRedisBlock || PROTOCOLS_CONFIG.Compound.CREATED_AT_BLOCK
    const eventFilter = this.pool.filters.DistributedBorrowerComp()

    this.iterateBlocksByRange(10_000, fromBlock, latestBlock, async (fromBlock, toBlock) => {
      const events = await this.pool.queryFilter(eventFilter, fromBlock, toBlock)
      const users = events.map(event => event.args.borrower)

      this.emitEvent({ users, toBlock })
      this.emitAllDataProcessed(toBlock, latestBlock)
    })
  }
}

module.exports = {
  FetcherCompound,
}
