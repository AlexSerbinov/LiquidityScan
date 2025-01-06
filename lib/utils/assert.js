'use strict'

/**
 * Custom assert
 */
function assert(expression, message, type, data) {
  if (expression) return
  const error = new Error(message)
  if (type) Object.assign(error, {type})
  if (data) Object.assign(error, {data})
  throw error
}

module.exports = {assert}
