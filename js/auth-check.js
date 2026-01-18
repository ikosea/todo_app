/**
 * Authentication Check Module
 * Checks if user is authenticated and redirects if not
 */

import { API } from './api.js';

export const AuthCheck = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
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
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
};

