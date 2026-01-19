/**
 * Authentication Check Module
 * Checks if user is authenticated and redirects if not
 */

import { API } from './api.js';
import { CONFIG } from './config.js';
import { safeJsonParse } from './utils.js';

export const AuthCheck = {
    /**
     * Check if user is authenticated
     */
    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
        return token !== null && token !== undefined;
    },

    /**
     * Verify token and get current user
     */
    async verifyAuth() {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            const user = await API.getCurrentUser();
            return user !== null;
        } catch (error) {
            return false;
        }
    },

    /**
     * Require authentication (redirect if not authenticated)
     */
    async requireAuth() {
        const isAuth = await this.verifyAuth();
        if (!isAuth) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    },

    /**
     * Get current user from localStorage
     */
    /**
     * Get current user from localStorage
     * @returns {Object|null} User object or null
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(CONFIG.STORAGE.CURRENT_USER);
        return safeJsonParse(userStr, null);
    }
};

