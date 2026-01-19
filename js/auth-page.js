/**
 * Auth Page - Handles authentication UI state and form submission
 */

import { API } from './api.js';
import { CONFIG } from './config.js';

class AuthPage {
    constructor() {
        // Single source of truth
        this.authMode = 'signin';
        this.init();
    }

    /**
     * Initialize the page
     */
    init() {
        this.setupMenuBar();
        this.setupTabs();
        this.setupForms();
        this.updateUI();
    }

    /**
     * Setup menu bar interactions
     */
    setupMenuBar() {
        const authMenu = document.getElementById('auth-menu');
        const dropdown = document.getElementById('auth-dropdown');
        const dropdownItems = dropdown.querySelectorAll('.mac-dropdown-item');

        // Toggle dropdown on menu click
        authMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            authMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            authMenu.classList.remove('active');
        });

        // Handle dropdown item clicks
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = item.getAttribute('data-mode');
                this.setAuthMode(mode);
                authMenu.classList.remove('active');
            });
        });
    }

    /**
     * Setup tab interactions
     */
    setupTabs() {
        const tabs = document.querySelectorAll('.mac-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-mode');
                this.setAuthMode(mode);
            });
        });
    }

    /**
     * Setup form submissions
     */
    setupForms() {
        const signinForm = document.getElementById('signin-form');
        const signupForm = document.getElementById('signup-form');

        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignIn();
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignUp();
        });
    }

    /**
     * Set authentication mode (single source of truth)
     */
    setAuthMode(mode) {
        if (mode === 'signin' || mode === 'signup') {
            this.authMode = mode;
            this.updateUI();
        }
    }

    /**
     * Update all UI elements based on authMode
     */
    updateUI() {
        // Update tabs
        document.querySelectorAll('.mac-tab').forEach(tab => {
            if (tab.getAttribute('data-mode') === this.authMode) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            if (form.getAttribute('data-mode') === this.authMode) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }

    /**
     * Handle sign in form submission
     */
    async handleSignIn() {
        const username = document.getElementById('signin-username').value.trim();
        const password = document.getElementById('signin-password').value;
        const errorEl = document.getElementById('signin-error');

        errorEl.classList.remove('show');
        errorEl.textContent = '';

        if (!username || !password) {
            errorEl.textContent = 'Please fill in all fields';
            errorEl.classList.add('show');
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH.LOGIN}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            let data = null;
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    const text = await response.text();
                    data = text ? JSON.parse(text) : null;
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    errorEl.textContent = 'Invalid response from server';
                    errorEl.classList.add('show');
                    return;
                }
            }

            if (response.ok) {
                if (data && data.token) {
                    // Store authentication token and user data
                    localStorage.setItem(CONFIG.STORAGE.AUTH_TOKEN, data.token);
                    localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(data.user));
                    
                    // Check if we're in desktop mode
                    if (document.body.classList.contains('desktop-body')) {
                        window.location.reload();
                    } else {
                        window.location.href = 'desktop.html';
                    }
                } else {
                    errorEl.textContent = 'Invalid response from server';
                    errorEl.classList.add('show');
                }
            } else {
                // Server returned an error response
                errorEl.textContent = (data && data.error) ? data.error : `Login failed (${response.status})`;
                errorEl.classList.add('show');
            }
        } catch (error) {
            // Distinguish between connection errors and other errors
            console.error('Login error:', error);
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Network/connection error
                errorEl.textContent = 'Connection error. Make sure backend is running on http://localhost:5000';
            } else if (error.name === 'NetworkError' || error.message.includes('network')) {
                errorEl.textContent = 'Network error. Please check your connection.';
            } else {
                // Other errors
                errorEl.textContent = error.message || 'An unexpected error occurred.';
            }
            errorEl.classList.add('show');
        }
    }

    /**
     * Handle sign up form submission
     */
    async handleSignUp() {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');

        errorEl.classList.remove('show');
        errorEl.textContent = '';

        if (!username || !email || !password) {
            errorEl.textContent = 'Please fill in all fields';
            errorEl.classList.add('show');
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.classList.add('show');
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH.REGISTER}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });

            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            let data = null;
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    const text = await response.text();
                    data = text ? JSON.parse(text) : null;
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    errorEl.textContent = 'Invalid response from server';
                    errorEl.classList.add('show');
                    return;
                }
            }

            if (response.ok) {
                if (data && data.user) {
                    // Store user data
                    localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(data.user));
                    
                    // Check if we're in desktop mode
                    if (document.body.classList.contains('desktop-body')) {
                        window.location.reload();
                    } else {
                        window.location.href = 'desktop.html';
                    }
                } else {
                    errorEl.textContent = 'Invalid response from server';
                    errorEl.classList.add('show');
                }
            } else {
                // Server returned an error response
                errorEl.textContent = (data && data.error) ? data.error : `Registration failed (${response.status})`;
                errorEl.classList.add('show');
            }
        } catch (error) {
            // Distinguish between connection errors and other errors
            console.error('Registration error:', error);
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Network/connection error
                errorEl.textContent = 'Connection error. Make sure backend is running on http://localhost:5000';
            } else if (error.name === 'NetworkError' || error.message.includes('network')) {
                errorEl.textContent = 'Network error. Please check your connection.';
            } else {
                // Other errors
                errorEl.textContent = error.message || 'An unexpected error occurred.';
            }
            errorEl.classList.add('show');
        }
    }
}

// Export for use in windows
export default AuthPage;

// Initialize page when DOM is ready (only if not in a window)
if (document.body && !document.body.classList.contains('desktop-body')) {
    document.addEventListener('DOMContentLoaded', () => {
        new AuthPage();
    });
}

