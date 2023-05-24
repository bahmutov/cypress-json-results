function getStateEmoji(state) {
  const emoji = {
    passed: '✅',
    failed: '❌',
    pending: '✋',
    skipped: '↩️',
  }
  return emoji[state] || '🤷'
}

module.exports = { getStateEmoji }
