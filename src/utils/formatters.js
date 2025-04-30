/**
 * Format a date timestamp to a readable date string
 * @param {number} timestamp - The timestamp in milliseconds
 * @param {Object} options - The formatting options (optional)
 * @returns {string} - Formatted date string
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return 'No date';
  
  const date = new Date(timestamp);
  
  // Default to short date format if no options provided
  if (Object.keys(options).length === 0) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a date timestamp to a readable time string
 * @param {number} timestamp - The timestamp in milliseconds
 * @param {Object} options - The formatting options (optional)
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp, options = {}) => {
  if (!timestamp) return 'No time';
  
  const date = new Date(timestamp);
  
  // Default to short time format if no options provided
  if (Object.keys(options).length === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  }
  
  return date.toLocaleTimeString('en-US', options);
};

/**
 * Format a date timestamp to a readable datetime string
 * @param {number} timestamp - The timestamp in milliseconds
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'No date/time';
  
  return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
};

/**
 * Format currency amount in cents to dollars with $ symbol
 * @param {number} cents - The amount in cents 
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (cents) => {
  if (cents === undefined || cents === null) return '$0.00';
  
  const dollars = cents / 100;
  return '$' + dollars.toFixed(2);
};

/**
 * Format a number with commas for thousands
 * @param {number} number - The number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format a duration in milliseconds to readable time
 * @param {number} milliseconds - The duration in milliseconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds) return '0 minutes';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
};

/**
 * Format a relative time from now (e.g. "2 days ago", "in 3 hours")
 * @param {number} timestamp - The timestamp in milliseconds
 * @returns {string} - Formatted relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const isPast = diff < 0;
  
  if (days > 30) {
    return formatDate(timestamp);
  } else if (days > 0) {
    return `${isPast ? '' : 'in '}${days} day${days !== 1 ? 's' : ''}${isPast ? ' ago' : ''}`;
  } else if (hours > 0) {
    return `${isPast ? '' : 'in '}${hours} hour${hours !== 1 ? 's' : ''}${isPast ? ' ago' : ''}`;
  } else if (minutes > 0) {
    return `${isPast ? '' : 'in '}${minutes} minute${minutes !== 1 ? 's' : ''}${isPast ? ' ago' : ''}`;
  } else if (seconds > 10) {
    return `${isPast ? '' : 'in '}${seconds} second${seconds !== 1 ? 's' : ''}${isPast ? ' ago' : ''}`;
  } else {
    return isPast ? 'just now' : 'in a few seconds';
  }
};