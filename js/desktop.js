/**
 * Desktop Module - Handles desktop environment
 * Phase 1: Desktop Foundation
 * Phase 2: Custom Cursor
 * Phase 3: Desktop Icons
 * Phase 4: Window System
 * Phase 5: App Integration
 */

import { WindowApps } from './window-apps.js';

class Desktop {
    constructor() {
        this.cursor = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.cursorState = 'normal';
        this.selectedIcon = null;
        this.windows = [];
        this.windowZIndex = 101;
        this.init();
    }

    /**
     * Initialize desktop
     */
    init() {
        this.initCursor();
        this.initIcons();
        this.attachEventListeners();
        console.log('Desktop initialized');
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

        // Set initial cursor position (center of screen)
        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
        this.updateCursorPosition();
    }

    /**
     * Update cursor position
     */
    updateCursorPosition() {
        if (!this.cursor) return;
        this.cursor.style.left = `${this.cursorX}px`;
        this.cursor.style.top = `${this.cursorY}px`;
    }

    /**
     * Update cursor state (normal, pointer, text, help, busy)
     */
    updateCursorState(newState) {
        if (!this.cursor || this.cursorState === newState) return;
        
        this.cursor.className = `mac-cursor mac-cursor-${newState}`;
        this.cursorState = newState;
        
        // Update cursor SVG source
        const cursorSvg = document.getElementById('cursor-svg');
        if (cursorSvg) {
            const cursorMap = {
                'normal': 'cursors/normal-select.svg',
                'pointer': 'cursors/link-select.svg',
                'help': 'cursors/help-select.svg',
                'busy': 'cursors/busy.svg'
            };
            
            if (cursorMap[newState]) {
                cursorSvg.src = cursorMap[newState];
            }
        }
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(e) {
        this.cursorX = e.clientX;
        this.cursorY = e.clientY;
        this.updateCursorPosition();

        // Update cursor state based on hover target
        const target = e.target;
        const tagName = target.tagName.toLowerCase();
        
        // Text cursor for input fields
        if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
            this.updateCursorState('text');
        } 
        // Help cursor for help elements
        else if (target.closest('.help, [data-help]')) {
            this.updateCursorState('help');
        }
        // Pointer/Hand cursor for clickable elements (including desktop icons)
        else if (target.closest('button, a, .clickable, .mac-menu-item, .mac-button, .desktop-icon')) {
            this.updateCursorState('pointer');
        } 
        // Normal arrow cursor for everything else
        else {
            this.updateCursorState('normal');
        }
    }

    /**
     * Set busy cursor (for loading states)
     */
    setBusyCursor() {
        this.updateCursorState('busy');
    }

    /**
     * Reset cursor to normal
     */
    resetCursor() {
        this.updateCursorState('normal');
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
        const token = localStorage.getItem('authToken');
        if (!token) {
            return false;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Show authentication required message
     */
    showAuthRequiredMessage() {
        // Create alert window
        const alertWindowId = `alert-${Date.now()}`;
        const alertWindow = document.createElement('div');
        alertWindow.id = alertWindowId;
        alertWindow.className = 'desktop-window desktop-alert-window';
        alertWindow.style.zIndex = this.windowZIndex + 100;
        alertWindow.style.width = '400px';
        alertWindow.style.height = '200px';

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

        // Add to DOM
        const windowsContainer = document.getElementById('windows-container');
        if (windowsContainer) {
            windowsContainer.appendChild(alertWindow);
        }

        // Close button
        const closeBtn = alertWindow.querySelector('#alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Remove from windows array
                const index = this.windows.findIndex(w => w.id === alertWindowId);
                if (index > -1) {
                    this.windows.splice(index, 1);
                }
                alertWindow.remove();
            });
        }

        // Open Auth button
        const openAuthBtn = alertWindow.querySelector('#open-auth-btn');
        if (openAuthBtn) {
            openAuthBtn.addEventListener('click', () => {
                // Remove from windows array
                const index = this.windows.findIndex(w => w.id === alertWindowId);
                if (index > -1) {
                    this.windows.splice(index, 1);
                }
                alertWindow.remove();
                this.openWindow('auth');
            });
        }

        // Add to windows array for proper z-index management
        this.windows.push({
            id: alertWindowId,
            appType: 'alert',
            element: alertWindow
        });

        // Focus the alert
        this.focusWindow(alertWindowId);
    }

    /**
     * Handle icon click
     */
    async handleIconClick(e, icon) {
        e.preventDefault();
        e.stopPropagation();

        // Remove previous selection
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('selected');
        }

        // Select clicked icon
        icon.classList.add('selected');
        this.selectedIcon = icon;

        // Get app type
        const appType = icon.getAttribute('data-app');
        
        // Auth app is always accessible
        if (appType === 'auth') {
            this.openWindow(appType);
            setTimeout(() => {
                icon.classList.remove('selected');
                this.selectedIcon = null;
            }, 200);
            return;
        }

        // Check authentication for other apps
        const isAuthenticated = await this.checkAuthentication();
        
        if (!isAuthenticated) {
            // Show authentication required message
            this.showAuthRequiredMessage();
            icon.classList.remove('selected');
            this.selectedIcon = null;
            return;
        }

        // Launch app window if authenticated
        this.openWindow(appType);
        
        // Deselect icon after a moment
        setTimeout(() => {
            icon.classList.remove('selected');
            this.selectedIcon = null;
        }, 200);
    }

    /**
     * Open a window for an app
     */
    openWindow(appType) {
        // Check if window already exists for this app
        const existingWindow = this.windows.find(w => w.appType === appType);
        if (existingWindow) {
            this.focusWindow(existingWindow.id);
            return;
        }

        // Create new window
        const windowId = `window-${Date.now()}`;
        const window = this.createWindow(windowId, appType);
        
        // Add to windows array
        this.windows.push({
            id: windowId,
            appType: appType,
            element: window
        });

        // Add to DOM
        const windowsContainer = document.getElementById('windows-container');
        if (windowsContainer) {
            windowsContainer.appendChild(window);
        }

        // Focus the new window
        this.focusWindow(windowId);
    }

    /**
     * Create window element
     */
    createWindow(id, appType) {
        const window = document.createElement('div');
        window.id = id;
        window.className = 'desktop-window';
        window.style.left = '100px';
        window.style.top = '100px';
        window.style.zIndex = this.windowZIndex++;

        // Window title based on app type
        const titles = {
            'productivity': 'Productivity App',
            'todo': 'Todo & Dashboard',
            'pomodoro': 'Pomodoro Timer',
            'auth': 'Authentication',
            'folder': 'Folder',
            'trash': 'Trash'
        };
        const title = titles[appType] || 'Window';

        // Get app content
        const appContent = WindowApps.getAppContent(appType);

        window.innerHTML = `
            <header class="mac-titlebar">
                <div class="mac-titlebar-controls">
                    <span class="mac-close" data-window-id="${id}"></span>
                    <span class="mac-minimize" data-window-id="${id}"></span>
                    <span class="mac-maximize" data-window-id="${id}"></span>
                </div>
                <h1 class="mac-title">${title}</h1>
            </header>
            ${appContent}
        `;

        // Add event listeners
        const closeBtn = window.querySelector('.mac-close');
        const minimizeBtn = window.querySelector('.mac-minimize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeWindow(id);
            });
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeWindow(id);
            });
        }

        // Make window draggable via titlebar
        const titlebar = window.querySelector('.mac-titlebar');
        if (titlebar) {
            this.makeWindowDraggable(window, titlebar);
        }

        // Focus window on click
        window.addEventListener('mousedown', () => {
            this.focusWindow(id);
        });

        // Initialize app JavaScript
        WindowApps.initApp(window, appType);

        return window;
    }

    /**
     * Focus a window (bring to front)
     */
    focusWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.style.zIndex = this.windowZIndex++;
        }
    }

    /**
     * Close a window
     */
    closeWindow(windowId) {
        const windowIndex = this.windows.findIndex(w => w.id === windowId);
        if (windowIndex !== -1) {
            const window = this.windows[windowIndex];
            window.element.remove();
            this.windows.splice(windowIndex, 1);
        }
    }

    /**
     * Minimize a window
     */
    minimizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.style.display = 'none';
            // Could add to a taskbar in future
        }
    }

    /**
     * Make window draggable
     */
    makeWindowDraggable(windowElement, titlebar) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('mac-close') || 
                e.target.classList.contains('mac-minimize') || 
                e.target.classList.contains('mac-maximize')) {
                return;
            }

            isDragging = true;
            initialX = e.clientX - windowElement.offsetLeft;
            initialY = e.clientY - windowElement.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                // Keep window within viewport
                const maxX = window.innerWidth - windowElement.offsetWidth;
                const maxY = window.innerHeight - windowElement.offsetHeight - 22; // Account for menu bar

                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));

                windowElement.style.left = currentX + 'px';
                windowElement.style.top = currentY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
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

    /**
     * Show desktop (minimize all windows)
     */
    showDesktop() {
        this.windows.forEach(window => {
            window.element.style.display = 'none';
        });
    }

    /**
     * Close all windows
     */
    closeAllWindows() {
        const windowsToClose = [...this.windows];
        windowsToClose.forEach(window => {
            this.closeWindow(window.id);
        });
    }

    /**
     * Restore all windows
     */
    restoreAllWindows() {
        this.windows.forEach(window => {
            window.element.style.display = 'flex';
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Hide cursor when mouse leaves window
        document.addEventListener('mouseleave', () => {
            if (this.cursor) {
                this.cursor.classList.add('hidden');
            }
        });

        // Show cursor when mouse enters window
        document.addEventListener('mouseenter', () => {
            if (this.cursor) {
                this.cursor.classList.remove('hidden');
            }
        });

        // Click on desktop to deselect icons
        document.querySelector('.desktop-wallpaper').addEventListener('click', (e) => {
            if (e.target.classList.contains('desktop-wallpaper') || e.target.classList.contains('desktop-icons')) {
                if (this.selectedIcon) {
                    this.selectedIcon.classList.remove('selected');
                    this.selectedIcon = null;
                }
            }
        });

        // Listen for app open events (from productivity menu)
        window.addEventListener('openApp', (e) => {
            const { appType } = e.detail;
            this.openWindow(appType);
        });

        // Listen for show desktop events (from window menus)
        window.addEventListener('showDesktop', () => {
            this.showDesktop();
        });

        // Listen for close window events (from window menus)
        window.addEventListener('closeWindow', (e) => {
            const { windowId } = e.detail;
            this.closeWindow(windowId);
        });

        // Listen for auth required events
        window.addEventListener('showAuthRequired', () => {
            this.showAuthRequiredMessage();
        });

        // Desktop menu bar interactions
        this.setupDesktopMenuBar();
    }

    /**
     * Setup desktop menu bar
     */
    setupDesktopMenuBar() {
        const specialMenu = document.getElementById('desktop-special-menu');
        const showDesktopBtn = document.getElementById('show-desktop');
        const closeAllBtn = document.getElementById('close-all-windows');

        // Show desktop button
        if (showDesktopBtn) {
            showDesktopBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDesktop();
                // Close dropdown
                if (specialMenu) {
                    specialMenu.classList.remove('active');
                }
            });
        }

        // Close all windows button
        if (closeAllBtn) {
            closeAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeAllWindows();
                // Close dropdown
                if (specialMenu) {
                    specialMenu.classList.remove('active');
                }
            });
        }

        // Toggle dropdown on menu click
        if (specialMenu) {
            specialMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                specialMenu.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (specialMenu && !specialMenu.contains(e.target)) {
                specialMenu.classList.remove('active');
            }
        });
    }
}

// Initialize desktop when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Desktop();
});

