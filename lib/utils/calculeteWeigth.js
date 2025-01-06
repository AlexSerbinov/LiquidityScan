// Constants for the number of users in each protocol
const V1ProxyUsers = 1674
const V2ProxyUsers = 23607
const V3ProxyUsers = 8313
const CompoundProxyUsers = 6531
const totalPowerUnits = 30 // Total power available for allocation

/**
 * Calculates the power allocation based on the number of users in each protocol.
 * @param {number} V1ProxyUsers - Number of users in V1Proxy
 * @param {number} V2ProxyUsers - Number of users in V2Proxy
 * @param {number} V3ProxyUsers - Number of users in V3Proxy
 * @param {number} CompoundProxyUsers - Number of users in CompoundProxy
 * @returns {Object} An object representing the power allocation for each protocol
 */
function allocatePower(V1ProxyUsers, V2ProxyUsers, V3ProxyUsers, CompoundProxyUsers) {
  // Calculate the total number of users across all protocols
  const totalUsers = V1ProxyUsers + V2ProxyUsers + V3ProxyUsers + CompoundProxyUsers
  
  // Calculate the power allocation for each protocol, rounded to the nearest whole number
  const powerAllocation = {
    V1Proxy: Math.round((V1ProxyUsers / totalUsers) * totalPowerUnits),
    V2Proxy: Math.round((V2ProxyUsers / totalUsers) * totalPowerUnits),
    V3Proxy: Math.round((V3ProxyUsers / totalUsers) * totalPowerUnits),
    CompoundProxy: Math.round((CompoundProxyUsers / totalUsers) * totalPowerUnits),
  }

  return powerAllocation // Return the calculated power allocation
}

// Calculate and store the power allocation based on the number of users
const powerAllocation = allocatePower(V1ProxyUsers, V2ProxyUsers, V3ProxyUsers, CompoundProxyUsers)
console.log(powerAllocation) // Output the power allocation to the console
