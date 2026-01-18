/**
 * API Module - Handles all backend API communication
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Get authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
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

export const API = {
    /**
     * Get all tasks from backend
     */
    async getTasks() {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            return data.tasks || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },

    /**
     * Add a new task to backend
     */
    async addTask(text) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({text: text})
            });
            if (!response.ok) throw new Error('Failed to add task');
            return await response.json();
        } catch (error) {
            console.error('Error adding task:', error);
            return null;
        }
    },

    /**
     * Delete a task from backend
     */
    async deleteTask(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete task');
            return await response.json();
        } catch (error) {
            console.error('Error deleting task:', error);
            return null;
        }
    },

    /**
     * Increment pomodoro count for a task
     */
    async incrementPomodoro(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/pomodoro`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to increment pomodoro');
            return await response.json();
        } catch (error) {
            console.error('Error incrementing pomodoro:', error);
            return null;
        }
    },

    /**
     * Login user
     */
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            if (!response.ok) throw new Error('Login failed');
            return await response.json();
        } catch (error) {
            console.error('Error logging in:', error);
            return null;
        }
    },

    /**
     * Register user
     */
    async register(username, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });
            if (!response.ok) throw new Error('Registration failed');
            return await response.json();
        } catch (error) {
            console.error('Error registering:', error);
            return null;
        }
    }
};

