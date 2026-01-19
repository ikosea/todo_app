/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Date string
 */
export function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Get start of week date
 * @returns {Date} Start of week date
 */
export function getWeekStart() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return weekStart;
}

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parse fails
 * @returns {*} Parsed object or fallback
 */
export function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return fallback;
    }
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Create error handler that logs and returns fallback
 * @param {string} context - Context for error message
 * @param {*} fallback - Fallback value to return
 * @returns {Function} Error handler function
 */
export function createErrorHandler(context, fallback = null) {
    return (error) => {
        console.error(`Error in ${context}:`, error);
        return fallback;
    };
}


