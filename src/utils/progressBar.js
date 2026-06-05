/**
 * Generate a visual progress bar with emoji indicator
 * @param {number} current - Current position in seconds
 * @param {number} total - Total duration in seconds
 * @param {number} size - Bar length in characters (default: 18)
 * @returns {string}
 */
function createProgressBar(current, total, size = 18) {
  if (!total || total === 0 || isNaN(total)) return '▬'.repeat(size);

  const progress = Math.min(Math.max(current / total, 0), 1);
  const filled = Math.round(progress * size);
  const empty = size - filled;

  const bar =
    '▬'.repeat(Math.max(0, filled - 1)) +
    (filled > 0 ? '🔘' : '') +
    '▬'.repeat(filled === 0 ? size : empty);

  return bar;
}

module.exports = { createProgressBar };
