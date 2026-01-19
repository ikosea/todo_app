/**
 * API Module - Handles all backend API communication
 */

import { CONFIG } from './config.js';
import { createErrorHandler } from './utils.js';
import { OfflineManager } from './offline.js';

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

// Create API request helper with offline support
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API.BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };
    
    // Check if offline
    if (!navigator.onLine && options.method && options.method !== 'GET') {
        // Queue operation for later sync
        await OfflineManager.init();
        const operationType = endpoint.includes('/tasks') && options.method === 'POST' ? 'addTask' : 
                              endpoint.includes('/tasks') && options.method === 'DELETE' ? 'deleteTask' :
                              endpoint.includes('/pomodoro') ? 'incrementPomodoro' : 'unknown';
        let bodyData = options.body ? JSON.parse(options.body) : {};
        // Extract task ID from endpoint if DELETE
        if (operationType === 'deleteTask') {
            const taskIdMatch = endpoint.match(/\/(\d+)$/);
            if (taskIdMatch) {
                bodyData = { id: parseInt(taskIdMatch[1]) };
            }
        }
        // Extract task ID from endpoint if incrementPomodoro
        if (operationType === 'incrementPomodoro') {
            const taskIdMatch = endpoint.match(/\/(\d+)\/pomodoro/);
            if (taskIdMatch) {
                bodyData = { taskId: parseInt(taskIdMatch[1]) };
            }
        }
        await OfflineManager.queueOperation({
            type: operationType,
            data: bodyData
        });
        throw new Error('Offline: Operation queued for sync');
    }
    
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
     * Get all tasks from backend (with offline fallback)
     * @returns {Promise<Array>} Array of tasks
     */
    async getTasks() {
        try {
            const data = await apiRequest(CONFIG.API.ENDPOINTS.TASKS);
            const tasks = data.tasks || [];
            // Save to IndexedDB for offline access
            if (tasks.length > 0) {
                await OfflineManager.init();
                for (const task of tasks) {
                    await OfflineManager.saveTask(task);
                }
            }
            return tasks;
        } catch (error) {
            // If offline, try to get from IndexedDB
            if (!navigator.onLine) {
                try {
                    await OfflineManager.init();
                    const tasks = await OfflineManager.getTasks();
                    return tasks;
                } catch (offlineError) {
                    console.warn('Offline data fetch failed:', offlineError);
                }
            }
            return createErrorHandler('getTasks', [])(error);
        }
    },

    /**
     * Add a new task to backend (with offline support)
     * @param {string} text - Task text
     * @returns {Promise<Object|null>} Created task or null
     */
    async addTask(text) {
        try {
            const task = await apiRequest(CONFIG.API.ENDPOINTS.TASKS, {
                method: 'POST',
                body: JSON.stringify({text: text})
            });
            // Save to IndexedDB for offline access
            if (task) {
                await OfflineManager.init();
                await OfflineManager.saveTask(task);
            }
            return task;
        } catch (error) {
            // If offline, save locally and queue for sync
            if (!navigator.onLine && error.message.includes('Offline')) {
                await OfflineManager.init();
                const tempTask = { id: Date.now(), name: text, pomodoro_count: 0, completed: false };
                await OfflineManager.saveTask(tempTask);
                return tempTask;
            }
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
     * Logout (clear local storage and redirect to landing)
     */
    logout() {
        localStorage.removeItem(CONFIG.STORAGE.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE.CURRENT_USER);
        // Redirect to landing page (relative to frontend/desktop.html)
        window.location.href = 'apps/landing.html';
    }
};
