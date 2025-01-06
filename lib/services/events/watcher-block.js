const { getProvider } = require("../../ethers/pool")
const { EventEmitter } = require("node:events")

/**
 * Class that will look for new block and send events.
 * It can use HTTP/HTTPS for polling or WS/WSS for WebSocket connection to monitor new blocks.
 */
class BlockWatcher {
  /**
   * Constructor for the BlockWatcher class.
   */
  constructor() {
    this.provider = getProvider()
    this.events = new EventEmitter()
    this.started = false
  }

  /**
   * Reset the current provider and set up a new one, appropriate for the current mode.
   */
  resetProvider() {
    this.provider = getProvider()
    if (this.mode === "ws" || this.mode === "wss") {
      this.provider.on("block", number => {
        this.events.emit("block", number)
      })
    }
  }

  /**
   * Start monitoring for new blocks.
   * @param {string} mode - the mode of operation: 'http', 'https', 'ws', or 'wss'
   * @param {number} interval - the polling interval in milliseconds for HTTP/HTTPS mode
   * @returns {BlockWatcher}
   */
  start(mode = "ws", interval = 10000) {
    if (typeof mode !== "string") {
      throw new TypeError("Mode must be a string")
    }
    if (this.started) return this
    this.mode = mode.toLowerCase()
    this.interval = interval
    this.started = true

    this.provider.on("error", e => {
      this.resetProvider()
      this.events.emit("error", e)
    })

    if (this.mode === "ws" || this.mode === "wss") {
      this.provider.on("block", number => {
        const date = new Date().toISOString()
        // console.log(`new block ${number} received via ${this.mode}, ${date}`)
        this.events.emit("block", number)
      })
    } else if (this.mode === "http" || this.mode === "https") {
      this.getBlockHttp(this.mode)
    }

    return this
  }

  /**
   * Poll for new blocks using HTTP or HTTPS.
   */
  async getBlockHttp(mode) {
    if (!this.started) return; // Exit the recursive loop when stopped
  
    const number = await this.provider.getBlockNumber();
    if (number !== this.blockNumber) {
      this.blockNumber = number;
      const date = new Date().toISOString();
      // console.log(`new block ${number} received via ${mode}. Updating interval = ${this.interval} ms, ${date}`);
  
      this.events.emit("block", number);
    }
  
    // Schedule the next call to getBlockHttp
    setTimeout(() => this.getBlockHttp(mode), this.interval);
  }

  /**
   * Stop monitoring for new blocks.
   * @returns {BlockWatcher}
   */
  stop() {
    this.started = false
    if (this.mode === "ws" || this.mode === "wss") {
      this.provider.removeAllListeners("block")
    }
    return this
  }

  /**
   * Add an event listener for the new block.
   * @param {Function} listener - callback function for new block event
   * @returns {BlockWatcher}
   */
  onBlock(listener) {
    this.events.on("block", listener)
    return this
  }

  /**
   * Add an event listener for errors.
   * @param {Function} listener - callback function for error event
   * @returns {BlockWatcher}
   */
  onError(listener) {
    this.events.on("error", listener)
    return this
  }
}

/**
 * Factory function to create a new BlockWatcher instance.
 * @returns {BlockWatcher}
 */
const createBlockWatcher = () => new BlockWatcher()

module.exports = { createBlockWatcher, BlockWatcher }
