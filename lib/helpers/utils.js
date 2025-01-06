const { Contract } = require("ethers")
const ERC20ABI = require("../artifacts/ERC20ABI")
const provider = require("../ethers")

const arrayIsEquals = (a, b) => {
  return a.length === b.length && a.every((value, i) => value === b[i])
}

const chunkArray = (arr, chunkSize) => {
  const newArr = [...arr]
  const chunks = []

  while (newArr.length) {
    chunks.push(newArr.splice(0, chunkSize))
  }

  return chunks
}

const iterateBlocksByRange = async (rangeSize, fromBlock, endBlock, callback) => {
  while (fromBlock < endBlock) {
    const toBlock = fromBlock + rangeSize > endBlock ? endBlock : fromBlock + rangeSize

    await callback(fromBlock, toBlock)

    fromBlock += rangeSize + 1
  }
}

const getAllPastEvents = async (contract, event, startBlock, endBlock) => {
  const allEvents = []
  const eventFilter = contract.filters[event]()

  await iterateBlocksByRange(10_000, startBlock, endBlock, async (fromBlock, toBlock) => {
    const events = await contract.queryFilter(eventFilter, fromBlock, toBlock)

    allEvents.push(...events)
  })

  return allEvents
}

const decimalsCache = new Map()
const getTokenDecimals = async address => {
  address = address.toLowerCase()

  if (decimalsCache.has(address)) {
    return Promise.resolve(decimalsCache.get(address))
  }

  const token = new Contract(address, ERC20ABI, provider)
  const decimals = await token.decimals()

  decimalsCache.set(address, decimals)

  return decimals
}

const findEventInBlock = async (provider, targetBlockNumber, topics) => {
  const logs = await provider.getLogs({
    fromBlock: targetBlockNumber,
    toBlock: targetBlockNumber,
    topics,
  })
  return logs
}

const prepareAssetsConfig = input => {
  const output = {}

  for (const asset in input) {
    for (const protocol in input[asset]) {
      const aggregators = input[asset][protocol]

      if (!Array.isArray(aggregators)) {
        continue
      }

      for (let index = 0; index < aggregators.length; index++) {
        const aggregator = aggregators[index]

        if (!output[aggregator]) {
          output[aggregator] = {}
        }

        if (!output[aggregator][protocol]) {
          output[aggregator][protocol] = new Set()
        }

        output[aggregator][protocol].add(asset)
      }
    }
  }

  for (const aggregator in output) {
    for (const protocol in output[aggregator]) {
      output[aggregator][protocol] = Array.from(output[aggregator][protocol])
    }
  }

  return output
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  arrayIsEquals,
  chunkArray,
  iterateBlocksByRange,
  getAllPastEvents,
  getTokenDecimals,
  findEventInBlock,
  prepareAssetsConfig,
  sleep,
}
