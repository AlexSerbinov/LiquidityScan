const { getArchiveData, setArchiveData, setLastModifyKey } = require("../../redis")

/**
 * Save unique users to the archive in Redis.
 * This function updates the archive by adding new users to the latest block and ensuring they are unique across all blocks.
 * @param {string} protocol - The protocol identifier for the archive.
 * @param {number} blockNumber - The block number to add the users to.
 * @param {Array<string>} users - The list of user addresses to add to the archive.
 * @param {string} column - The column in the archive to update (e.g., 'archive_users').
 * @returns {Promise<number>} - The number of unique users processed.
 */
const saveUsersToArchive = async (protocol, blockNumber, users, column) => {
  // Prepare the Redis connection

  // Create a set of unique users to avoid duplicates
  const uniqueUsers = new Set(users)

  // Fetch the existing archive data for the given column
  let archive = (await getArchiveData(protocol, column)) || {}

  // Initialize the archive object if it doesn't exist
  if (!archive) archive = {}

  // Remove users from all previous blocks if they appear in the new block
  Object.keys(archive).forEach(block => {
    if (block !== blockNumber.toString()) {
      archive[block] = archive[block].filter(userObj => !uniqueUsers.has(userObj.user))
    }
  })

  // Add new unique users to the current block
  archive[blockNumber] = archive[blockNumber] || []
  uniqueUsers.forEach(user => {
    if (!archive[blockNumber].some(userObj => userObj.user === user)) {
      archive[blockNumber].push({ user, reserves: {} }) // Add user with empty reserves object
    }
  })

  // Remove any blocks that are now empty after the filtering
  Object.keys(archive).forEach(block => {
    if (archive[block].length === 0) {
      delete archive[block]
    }
  })

  // Save the updated archive back to Redis
  await setArchiveData(protocol, column, archive)

  // Update the last modified timestamp for the protocol
  await setLastModifyKey(protocol, new Date().toISOString())

  // Return the count of unique users processed
  return uniqueUsers.size
}

/**
 * Find latest handled block from Redis.
 * @param {string} protocol - The protocol for which to find the latest block.
 * @returns {Promise<number>} - The latest block number found in the archive.
 */
const getLatestRedisBlock = async protocol => {
  // Construct the Redis key for the archive

  // Fetch the archive data for both 'archive_users'
  const archiveUsersData = await getArchiveData(protocol, "archive_users")

  let latestArchiveBlock = 0

  // Parse the data and extract the block numbers
  const archiveUsers = archiveUsersData ? Object.keys(archiveUsersData) : []

  // Determine the latest block number
  if (archiveUsers.length) {
    latestArchiveBlock = Math.max(...archiveUsers.map(Number))
  }
  return latestArchiveBlock
}

/**
 * Get the users in the archive for a given protocol.
 * @param {string} protocol - The protocol for which to get the users.
 * @returns {Promise<Array>} - The list of users in the archive.
 */
const getArchiveUsers = async protocol => {
  try {
    // Fetch the archive data for 'archive_users'
    const archiveUsersData = await getArchiveData(protocol, "archive_users")

    if (!archiveUsersData) {
      return []
    }

    const allUsers = Object.values(archiveUsersData).flat()
    return allUsers.map(userInfo => userInfo.user)
  } catch (error) {
    console.error(error)
    return []
  }
}

module.exports = {
  saveUsersToArchive,
  getLatestRedisBlock,
  getArchiveUsers,
}
