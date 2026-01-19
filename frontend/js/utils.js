/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Get week start date
 */
export function getWeekStart() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return weekStart;
}

/**
 * Create error handler function
 */
export function createErrorHandler(context, fallback = null) {
    return (error) => {
        console.error(`Error in ${context}:`, error);
        return fallback;
    };
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return fallback;
    }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Delay function
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get element by ID
 */
export function getElement(id) {
    return document.getElementById(id);
}

/**
 * Get elements by selector
 */
export function getElements(selector) {
    return document.querySelectorAll(selector);
}
