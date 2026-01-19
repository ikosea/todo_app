/**
 * Desktop Module - Handles desktop environment
 * Manages desktop UI, icons, cursor, and coordinates with WindowManager
 */

import { WindowManager } from './windowManager.js';
import { WindowApps } from './windowApps.js';
import { CONFIG } from './config.js';
import { delay, clamp } from './utils.js';

class Desktop {
    constructor() {
        this.cursor = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.cursorState = 'normal';
        this.selectedIcon = null;
        this.windowManager = new WindowManager();
        this.init();
    }

    /**
     * Initialize desktop
     */
    init() {
        this.initCursor();
        this.initIcons();
        this.attachEventListeners();
    }

    /**
     * Initialize custom cursor
     */
    initCursor() {
        this.cursor = document.getElementById('custom-cursor');
        if (!this.cursor) {
            console.error('Custom cursor element not found');
            return;
        }

        // Ensure cursor is visible and positioned
        this.cursor.style.display = 'block';
        this.cursor.style.visibility = 'visible';
        this.cursor.style.opacity = '1';
        this.cursor.style.position = 'fixed';
        this.cursor.style.pointerEvents = 'none';
        this.cursor.style.zIndex = '10000';
        this.cursor.style.left = '0';
        this.cursor.style.top = '0';
        this.cursor.style.margin = '0';
        this.cursor.style.padding = '0';

        // Set initial cursor position (center of screen)
        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
        this.updateCursorPosition();
        
        // Force initial update
        requestAnimationFrame(() => {
            this.updateCursorPosition();
            setTimeout(() => {
                this.updateCursorPosition();
            }, 10);
        });
    }

    /**
     * Update cursor position
     */
    updateCursorPosition() {
        if (!this.cursor) {
            this.cursor = document.getElementById('custom-cursor');
            if (!this.cursor) return;
        }
        
        // Calculate offset based on cursor state
        let offsetX = -2;
        let offsetY = -2;
        
        if (this.cursorState === 'text') {
            offsetX = -1;
            offsetY = 0;
        } else if (this.cursorState === 'pointer') {
            offsetX = -2;
            offsetY = -2;
        }
        
        // Set position using left/top
        this.cursor.style.left = `${this.cursorX + offsetX}px`;
        this.cursor.style.top = `${this.cursorY + offsetY}px`;
        
        // Update cursor image based on state
        const cursorImg = this.cursor.querySelector('img');
        if (cursorImg) {
            const cursorPath = CONFIG.CURSOR_PATHS[this.cursorState] || CONFIG.CURSOR_PATHS.normal;
            cursorImg.src = cursorPath;
        }
        
        // Update cursor class
        this.cursor.className = `mac-cursor mac-cursor-${this.cursorState}`;
    }

    /**
     * Update cursor state based on element under cursor
     */
    updateCursorState(x, y) {
        const element = document.elementFromPoint(x, y);
        if (!element) {
            this.cursorState = CONFIG.CURSOR.NORMAL;
            return;
        }

        // Check if over text input
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable) {
            this.cursorState = CONFIG.CURSOR.TEXT;
        }
        // Check if over clickable element
        else if (element.tagName === 'BUTTON' || 
                 element.tagName === 'A' || 
                 element.closest('button') || 
                 element.closest('a') ||
                 element.classList.contains('mac-close') ||
                 element.classList.contains('mac-minimize') ||
                 element.classList.contains('desktop-icon')) {
            this.cursorState = CONFIG.CURSOR.POINTER;
        }
        else {
            this.cursorState = CONFIG.CURSOR.NORMAL;
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Mouse move for cursor
        document.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
            this.updateCursorState(e.clientX, e.clientY);
            this.updateCursorPosition();
        });

        // Click on desktop to deselect icons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('desktop-wallpaper') || 
                e.target.classList.contains('desktop-body')) {
                this.deselectIcon();
            }
        });

        // Handle openApp events from navigation links
        window.addEventListener('openApp', (e) => {
            const appType = e.detail?.appType;
            if (appType) {
                this.openWindow(appType);
            }
        });

        // Handle window menu actions
        document.addEventListener('click', (e) => {
            if (e.target.id === 'show-desktop') {
                this.windowManager.showDesktop();
            } else if (e.target.id === 'close-all-windows') {
                this.windowManager.windows.forEach(w => {
                    this.windowManager.closeWindow(w.id);
                });
            }
        });
    }

    /**
     * Initialize desktop icons
     */
    initIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.addEventListener('click', (e) => this.handleIconClick(e, icon));
            icon.addEventListener('mousedown', (e) => this.handleIconMouseDown(e, icon));
            icon.addEventListener('mouseup', (e) => this.handleIconMouseUp(e, icon));
        });
    }

    /**
     * Check if user is authenticated
     */
    async checkAuthentication() {
        const token = localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH.ME}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            console.debug('Auth check failed:', error);
            return false;
        }
    }

    /**
     * Show authentication required message
     */
    showAuthRequiredMessage() {
        const alertWindowId = `alert-${Date.now()}`;
        const alertWindow = document.createElement('div');
        alertWindow.id = alertWindowId;
        alertWindow.className = 'desktop-window desktop-alert-window';
        alertWindow.style.zIndex = '10000';
        alertWindow.style.width = '400px';
        alertWindow.style.height = '200px';
        alertWindow.style.left = '50%';
        alertWindow.style.top = '50%';
        alertWindow.style.transform = 'translate(-50%, -50%)';

        alertWindow.innerHTML = `
            <header class="mac-titlebar">
                <div class="mac-titlebar-controls">
                    <span class="mac-close" id="alert-close"></span>
                    <span class="mac-minimize"></span>
                    <span class="mac-maximize"></span>
                </div>
                <h1 class="mac-title">Authentication Required</h1>
            </header>
            <div class="mac-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px;">
                <p style="margin-bottom: 16px; font-size: 12px;">You must sign in first to access this app.</p>
                <p style="margin-bottom: 24px; font-size: 12px;">Please click the Auth icon to sign in or sign up.</p>
                <button class="mac-button" id="open-auth-btn" style="width: auto; padding: 8px 24px;">Open Auth</button>
            </div>
        `;

        const windowsContainer = document.getElementById('windows-container');
        if (windowsContainer) {
            windowsContainer.appendChild(alertWindow);
        }

        const closeBtn = alertWindow.querySelector('#alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alertWindow.remove();
            });
        }

        const openAuthBtn = alertWindow.querySelector('#open-auth-btn');
        if (openAuthBtn) {
            openAuthBtn.addEventListener('click', () => {
                alertWindow.remove();
                this.openWindow('auth');
            });
        }
    }

    /**
     * Handle icon click
     */
    async handleIconClick(e, icon) {
        e.stopPropagation();
        const appType = icon.getAttribute('data-app');
        
        if (!appType) return;

        // Select icon
        this.selectIcon(icon);

        // Check if app requires authentication
        const requiresAuth = ['pomodoro', 'todo', 'dashboard'].includes(appType);
        
        if (requiresAuth) {
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                this.showAuthRequiredMessage();
                return;
            }
        }

        // Open window
        this.openWindow(appType);
    }

    /**
     * Open a window for an app
     */
    openWindow(appType) {
        this.windowManager.openWindow(
            appType,
            (appType) => WindowApps.getAppContent(appType),
            (windowElement, appType) => WindowApps.initApp(windowElement, appType)
        );
    }

    /**
     * Select an icon
     */
    selectIcon(icon) {
        this.deselectIcon();
        icon.classList.add('selected');
        this.selectedIcon = icon;
    }

    /**
     * Deselect current icon
     */
    deselectIcon() {
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('selected');
            this.selectedIcon = null;
        }
    }

    /**
     * Handle icon mouse down (press feedback)
     */
    handleIconMouseDown(e, icon) {
        icon.classList.add('pressed');
    }

    /**
     * Handle icon mouse up (release feedback)
     */
    handleIconMouseUp(e, icon) {
        icon.classList.remove('pressed');
    }
}

// Initialize desktop when DOM is ready
function initDesktop() {
    console.log('Initializing Desktop...');
    try {
        const desktop = new Desktop();
        console.log('Desktop initialized successfully');
        return desktop;
    } catch (error) {
        console.error('Error initializing Desktop:', error);
        console.error('Error stack:', error.stack);
        alert('Failed to initialize desktop. Check console for details.');
        throw error;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktop);
} else {
    initDesktop();
}

