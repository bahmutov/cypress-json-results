function getStateEmoji(state) {
  const emoji = {
    passed: '✅',
    failed: '❌',
    pending: '✋',
    skipped: '↩️',
  }
  return emoji[state] || '🤷'
}

/**
 * Receives an object of "test name": "state"
 * and returns a single emoji for passing or failing.
 */
function getSpecEmoji(testResults) {
  const failed = Object.values(testResults).includes('failed')
  if (failed) {
    return '❌'
  }
  const passed = Object.values(testResults).includes('passed')
  return passed ? '✅' : '✋'
}

module.exports = { getStateEmoji, getSpecEmoji }
