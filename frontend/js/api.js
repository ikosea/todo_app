/**
 * API Module - Handles all backend API communication
 */

import { CONFIG } from './config.js';
import { createErrorHandler } from './utils.js';

// Get authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
}

// Create headers with authentication token
function getAuthHeaders() {
    const headers = {'Content-Type': 'application/json'};
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Create API request helper
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API.BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                }
            } catch (parseError) {
                // Ignore JSON parse errors, use default message
            }
            throw new Error(errorMessage);
        }
        
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        }
        return null;
    } catch (error) {
        // Check for specific network/CORS errors
        if (error instanceof TypeError) {
            // Network error (backend not running, CORS issue, etc.)
            if (error.message.includes('fetch') || 
                error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.message.includes('Load failed')) {
                throw new Error('Connection error. Make sure backend is running on http://localhost:5000 and CORS is enabled');
            }
        }
        // Re-throw other errors as-is
        throw error;
    }
}

export const API = {
    /**
     * Get all tasks from backend
     * @returns {Promise<Array>} Array of tasks
     */
    async getTasks() {
        try {
            const data = await apiRequest(CONFIG.API.ENDPOINTS.TASKS);
            return data.tasks || [];
        } catch (error) {
            return createErrorHandler('getTasks', [])(error);
        }
    },

    /**
     * Add a new task to backend
     * @param {string} text - Task text
     * @returns {Promise<Object|null>} Created task or null
     */
    async addTask(text) {
        try {
            return await apiRequest(CONFIG.API.ENDPOINTS.TASKS, {
                method: 'POST',
                body: JSON.stringify({text})
            });
        } catch (error) {
            return createErrorHandler('addTask', null)(error);
        }
    },

    /**
     * Delete a task from backend
     * @param {number} taskId - Task ID to delete
     * @returns {Promise<Object|null>} Response or null
     */
    async deleteTask(taskId) {
        try {
            return await apiRequest(`${CONFIG.API.ENDPOINTS.TASKS}/${taskId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            return createErrorHandler('deleteTask', null)(error);
        }
    },

    /**
     * Increment pomodoro count for a task
     * @param {number} taskId - Task ID
     * @returns {Promise<Object|null>} Updated task or null
     */
    async incrementPomodoro(taskId) {
        try {
            return await apiRequest(`${CONFIG.API.ENDPOINTS.TASKS}/${taskId}/pomodoro`, {
                method: 'POST'
            });
        } catch (error) {
            return createErrorHandler('incrementPomodoro', null)(error);
        }
    },

    /**
     * Login user
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Promise<Object|null>} Login response or null
     */
    async login(username, password) {
        try {
            return await apiRequest(CONFIG.API.ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
        } catch (error) {
            return createErrorHandler('login', null)(error);
        }
    },

    /**
     * Register user
     * @param {string} username - Username
     * @param {string} email - Email
     * @param {string} password - Password
     * @returns {Promise<Object|null>} Registration response or null
     */
    async register(username, email, password) {
        try {
            return await apiRequest(CONFIG.API.ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });
        } catch (error) {
            return createErrorHandler('register', null)(error);
        }
    },

    /**
     * Get current user
     * @returns {Promise<Object|null>} User object or null
     */
    async getCurrentUser() {
        try {
            return await apiRequest(CONFIG.API.ENDPOINTS.AUTH.ME);
        } catch (error) {
            return createErrorHandler('getCurrentUser', null)(error);
        }
    },

    /**
     * Logout (clear local storage and reload)
     */
    logout() {
        localStorage.removeItem(CONFIG.STORAGE.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE.CURRENT_USER);
        window.location.reload();
    }
};
