// Converts a number to a string and pads it to 2 digits with zeros if necessary
const padTo2Digits = num => num.toString().padStart(2, "0")

// Converts milliseconds to a time string in the format HH:MM:SS
const convertMsToTime = milliseconds => {
  // Convert milliseconds to seconds, minutes, and hours
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  // Calculate remaining seconds and minutes after converting to hours and minutes
  seconds = seconds % 60
  minutes = minutes % 60

  // Return the formatted time string
  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

module.exports = { convertMsToTime }
