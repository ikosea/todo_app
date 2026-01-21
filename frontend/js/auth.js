/**
 * Authentication Module
 * Handles sign up, sign in, and session management
 */

import { API } from './api.js';
import { CONFIG } from './config.js';

export class Auth {
    /**
     * Initialize authentication in a window
     * @param {HTMLElement} windowElement - The window element containing auth UI
     */
    static init(windowElement) {
        this.setupTabs(windowElement);
        this.setupForms(windowElement);
        this.updateUI(windowElement, 'signin');
    }

    /**
     * Setup tab interactions
     */
    static setupTabs(windowElement) {
        const tabs = windowElement.querySelectorAll('.mac-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-mode');
                this.updateUI(windowElement, mode);
            });
        });
    }

    /**
     * Setup form submissions
     */
    static setupForms(windowElement) {
        const signinForm = windowElement.querySelector('#signin-form');
        const signupForm = windowElement.querySelector('#signup-form');

        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn(windowElement);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp(windowElement);
            });
        }
    }

    /**
     * Update UI based on mode
     */
    static updateUI(windowElement, mode) {
        // Update tabs
        windowElement.querySelectorAll('.mac-tab').forEach(tab => {
            if (tab.getAttribute('data-mode') === mode) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update forms
        windowElement.querySelectorAll('.auth-form').forEach(form => {
            if (form.getAttribute('data-mode') === mode) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }

    /**
     * Handle sign in
     */
    static async handleSignIn(windowElement) {
        const username = windowElement.querySelector('#signin-username').value.trim();
        const password = windowElement.querySelector('#signin-password').value;
        const errorEl = windowElement.querySelector('#signin-error');

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
                    localStorage.setItem(CONFIG.STORAGE.AUTH_TOKEN, data.token);
                    localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(data.user));
                    // Check if we're in desktop mode (window element exists) or standalone auth page
                    const isInDesktop = windowElement && windowElement.closest('.desktop-window');
                    if (isInDesktop) {
                        // In desktop window, reload to refresh auth state
                        window.location.reload();
                    } else {
                        // Standalone auth page, redirect to desktop
                        window.location.href = '../desktop.html';
                    }
                } else {
                    errorEl.textContent = 'Invalid response from server';
                    errorEl.classList.add('show');
                }
            } else {
                errorEl.textContent = (data && data.error) ? data.error : `Login failed (${response.status})`;
                errorEl.classList.add('show');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Check for network/CORS errors
            if (error instanceof TypeError && (
                error.message.includes('fetch') || 
                error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.message.includes('Load failed')
            )) {
                errorEl.textContent = 'Connection error. Make sure backend is running on http://localhost:5000 and CORS is enabled.';
            } else if (error.message && error.message.includes('Connection error')) {
                errorEl.textContent = error.message;
            } else {
                errorEl.textContent = error.message || 'An unexpected error occurred.';
            }
            errorEl.classList.add('show');
        }
    }

    /**
     * Handle sign up
     */
    static async handleSignUp(windowElement) {
        const username = windowElement.querySelector('#signup-username').value.trim();
        const email = windowElement.querySelector('#signup-email').value.trim();
        const password = windowElement.querySelector('#signup-password').value;
        const errorEl = windowElement.querySelector('#signup-error');

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
                // Best case: backend returns token on registration (auto-login)
                if (data && data.token) {
                    localStorage.setItem(CONFIG.STORAGE.AUTH_TOKEN, data.token);
                    if (data.user) {
                        localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(data.user));
                    }

                    const isInDesktop = windowElement && windowElement.closest('.desktop-window');
                    if (isInDesktop) {
                        window.location.reload();
                    } else {
                        window.location.href = '../desktop.html';
                    }
                    return;
                }

                // Otherwise: auto-login with the same credentials after successful registration
                const loginResponse = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH.LOGIN}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ username, password })
                });

                const loginContentType = loginResponse.headers.get('content-type');
                let loginData = null;
                if (loginContentType && loginContentType.includes('application/json')) {
                    const loginText = await loginResponse.text();
                    loginData = loginText ? JSON.parse(loginText) : null;
                }

                if (loginResponse.ok && loginData && loginData.token) {
                    localStorage.setItem(CONFIG.STORAGE.AUTH_TOKEN, loginData.token);
                    if (loginData.user) {
                        localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(loginData.user));
                    } else if (data && data.user) {
                        localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(data.user));
                    }

                    const isInDesktop = windowElement && windowElement.closest('.desktop-window');
                    if (isInDesktop) {
                        window.location.reload();
                    } else {
                        window.location.href = '../desktop.html';
                    }
                } else {
                    // Fallback: keep them on auth page and prompt sign-in
                    if (data && data.user) {
                        localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, JSON.stringify(data.user));
                    }
                    this.updateUI(windowElement, 'signin');
                    errorEl.textContent = 'Registration successful! Please sign in.';
                    errorEl.style.color = '#000000';
                    errorEl.classList.add('show');
                }
            } else {
                errorEl.textContent = (data && data.error) ? data.error : `Registration failed (${response.status})`;
                errorEl.classList.add('show');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Check for network/CORS errors
            if (error instanceof TypeError && (
                error.message.includes('fetch') || 
                error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.message.includes('Load failed')
            )) {
                errorEl.textContent = 'Connection error. Make sure backend is running on http://localhost:5000 and CORS is enabled.';
            } else if (error.message && error.message.includes('Connection error')) {
                errorEl.textContent = error.message;
            } else {
                errorEl.textContent = error.message || 'An unexpected error occurred.';
            }
            errorEl.classList.add('show');
        }
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated() {
        return !!localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
    }

    /**
     * Get current user
     */
    static getCurrentUser() {
        const userStr = localStorage.getItem(CONFIG.STORAGE.CURRENT_USER);
        return userStr ? JSON.parse(userStr) : null;
    }
}
