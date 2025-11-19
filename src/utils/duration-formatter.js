/**
 * Formats duration in seconds to a readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "5m 30s" or "1h 15m 30s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) {
    return "0s";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(" ");
}

