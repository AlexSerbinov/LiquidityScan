const { getArchiveData } = require("../../redis")

/**
 * @param {string} protocol - The protocol name V1, V2, V3, Compound, Liquity, MakerDAO_CDP.
 * @param {Queue} queue - The queue instance to add the users to process.
 * @param {object} params - The object that contains all params from $.params.
 * @param {number} params.batchSize - The number of users to process on simulator by one request. Can produce the error with values more than 35-50.
 * @param {boolean} params.useSimulatorInsteadOfNode - The mode of the service. 'node' or 'simulator'.
 */
const getArchiveUsersAndStartScanning = async (protocol, queue, params) => {
  try {
    // Fetch the archive data for 'archive_users'
    const archiveUsersData = await getArchiveData(protocol, "archive_users")
    let allUsers = []
    if (archiveUsersData) {
      allUsers = Object.values(archiveUsersData).flat()
    }
    const users = allUsers.map(userInfo => userInfo.user)

    const batches = splitUsersIntoBatches(users, params)
    addUsersToQueue(batches, queue, params.useSimulatorInsteadOfNode)
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * Split users into batches.
 *
 * @param {Array} users - The array of users to split into batches.
 * @param {object} params - The object that contains all params from $.params.
 * @param {number} params.batchSize - The number of users to process on simulator by one request. Can produce the error with values more than 35-50.
 * @param {boolean} params.useSimulatorInsteadOfNode - The mode of the service. 'node' or 'simulator'.
 * @returns {Array} - An array of user batches.
 */
const splitUsersIntoBatches = (users, params) => {
  const batchSize = params.useSimulatorInsteadOfNode ? params.batchSize || 30 : 1
  const batches = []
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    batches.push(batch)
  }
  return batches
}

/**
 * Add users to the queue for processing.
 * @param {Array} batches - The array of user batches.
 * @param {Queue} queue - The queue instance to add the users to.
 * @param {boolean} useSimulatorInsteadOfNode - The mode of the service. 'node' or 'simulator'.
 */
const addUsersToQueue = (batches, queue, useSimulatorInsteadOfNode) => {
  try {
    batches.forEach(batch => {
      useSimulatorInsteadOfNode || batch.length > 1
      queue.add(batch)
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = {
  getArchiveUsersAndStartScanning,
}
