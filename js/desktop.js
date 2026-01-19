/**
 * Desktop Module - Handles desktop environment
 * Manages desktop UI, windows, icons, cursor, and window interactions
 */

import { WindowApps } from './window-apps.js';
import { CONFIG } from './config.js';
import { delay, clamp } from './utils.js';

class Desktop {
    constructor() {
        this.cursor = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.cursorState = 'normal';
        this.selectedIcon = null;
        this.windows = [];
        this.windowZIndex = CONFIG.WINDOW.INITIAL_Z_INDEX;
        this.activeWindowId = null; // Track active window
        this.minimizedWindows = []; // Track minimized windows
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
        
        // Force initial update with multiple attempts
        requestAnimationFrame(() => {
            this.updateCursorPosition();
            setTimeout(() => {
                this.updateCursorPosition();
            }, 10);
        });
        
        console.log('Cursor initialized at:', this.cursorX, this.cursorY);
        console.log('Cursor element:', this.cursor);
        console.log('Cursor styles:', {
            display: this.cursor.style.display,
            visibility: this.cursor.style.visibility,
            position: this.cursor.style.position,
            left: this.cursor.style.left,
            top: this.cursor.style.top
        });
    }

    /**
     * Update cursor position
     */
    updateCursorPosition() {
        if (!this.cursor) {
            // Try to re-initialize cursor if it's missing
            this.cursor = document.getElementById('custom-cursor');
            if (!this.cursor) return;
        }
        
        // Calculate offset based on cursor state
        let offsetX = -2;
        let offsetY = -2;
        
        if (this.cursorState === 'text') {
            // Text cursor (I-beam) is centered horizontally, aligned to top
            offsetX = -1; // Center the 2px wide I-beam
            offsetY = 0;
        } else if (this.cursorState === 'pointer') {
            offsetX = -2;
            offsetY = -2;
        }
        
        // Use left/top positioning for more reliable updates
        const x = this.cursorX + offsetX;
        const y = this.cursorY + offsetY;
        
        // For text cursor, use transform to center it properly
        if (this.cursorState === 'text') {
            this.cursor.style.left = `${this.cursorX}px`;
            this.cursor.style.top = `${this.cursorY}px`;
            this.cursor.style.transform = 'translate(-1px, 0)';
        } else {
            // For other cursors, use left/top directly
            this.cursor.style.left = `${x}px`;
            this.cursor.style.top = `${y}px`;
            this.cursor.style.transform = 'none';
        }
        
        this.cursor.style.display = 'block';
        this.cursor.style.visibility = 'visible';
        this.cursor.style.opacity = '1';
        this.cursor.classList.remove('hidden');
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
        if (cursorSvg && CONFIG.CURSOR_PATHS[newState]) {
            cursorSvg.src = CONFIG.CURSOR_PATHS[newState];
        }
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(e) {
        // Update cursor position immediately
        this.cursorX = e.clientX;
        this.cursorY = e.clientY;
        
        // Ensure cursor exists and is visible
        if (!this.cursor) {
            this.cursor = document.getElementById('custom-cursor');
            if (!this.cursor) {
                console.warn('Cursor element not found in handleMouseMove');
                return;
            }
        }
        
        // Ensure cursor is visible
        this.cursor.style.display = 'block';
        this.cursor.style.visibility = 'visible';
        this.cursor.style.opacity = '1';
        this.cursor.classList.remove('hidden');
        
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
            // Silently fail - don't show connection errors during auth check
            // This is called on page load and shouldn't spam errors
            console.debug('Auth check failed:', error);
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
        window.style.left = `${CONFIG.WINDOW.DEFAULT_X}px`;
        window.style.top = `${CONFIG.WINDOW.DEFAULT_Y}px`;
        window.style.width = `${CONFIG.WINDOW.DEFAULT_WIDTH}px`;
        window.style.height = `${CONFIG.WINDOW.DEFAULT_HEIGHT}px`;
        window.style.zIndex = this.windowZIndex++;

        // Window title based on app type
        const title = CONFIG.WINDOW_TITLES[appType] || 'Window';

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

        // Make window resizable
        this.makeWindowResizable(window);

        // Focus window on click (anywhere on window)
        window.addEventListener('mousedown', (e) => {
            // Don't focus if clicking on controls (they handle their own events)
            if (!e.target.closest('.mac-titlebar-controls')) {
                this.focusWindow(id);
            }
        });

        // Initialize app JavaScript
        WindowApps.initApp(window, appType);

        return window;
    }

    /**
     * Focus a window (bring to front)
     * Phase 6: Window Management - Active window highlighting
     */
    focusWindow(windowId) {
        // Remove active class from all windows
        this.windows.forEach(w => {
            w.element.classList.remove('window-active');
        });

        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            // Bring to front
            window.element.style.zIndex = this.windowZIndex++;
            // Add active class for visual highlighting
            window.element.classList.add('window-active');
            this.activeWindowId = windowId;
        }
    }

    /**
     * Close a window
     * Phase 6: Window Management - Clean up active/minimized state
     */
    closeWindow(windowId) {
        const windowIndex = this.windows.findIndex(w => w.id === windowId);
        if (windowIndex !== -1) {
            const window = this.windows[windowIndex];
            window.element.remove();
            this.windows.splice(windowIndex, 1);
            
            // Clean up state
            if (this.activeWindowId === windowId) {
                this.activeWindowId = null;
            }
            const minimizedIndex = this.minimizedWindows.indexOf(windowId);
            if (minimizedIndex > -1) {
                this.minimizedWindows.splice(minimizedIndex, 1);
            }
        }
    }

    /**
     * Minimize a window
     * Phase 6: Window Management - Store minimized state for restore
     */
    minimizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.style.display = 'none';
            window.element.classList.remove('window-active');
            // Track minimized state
            if (!this.minimizedWindows.includes(windowId)) {
                this.minimizedWindows.push(windowId);
            }
            // Clear active window if this was active
            if (this.activeWindowId === windowId) {
                this.activeWindowId = null;
            }
        }
    }

    /**
     * Restore a minimized window
     * Phase 6: Window Management - Restore functionality
     */
    restoreWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.style.display = 'flex';
            // Remove from minimized list
            const index = this.minimizedWindows.indexOf(windowId);
            if (index > -1) {
                this.minimizedWindows.splice(index, 1);
            }
            // Focus the restored window
            this.focusWindow(windowId);
        }
    }

    /**
     * Make window resizable
     */
    makeWindowResizable(windowElement) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'window-resize-handle';
        windowElement.appendChild(resizeHandle);

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(windowElement).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(windowElement).height, 10);
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);

            // Enforce minimum size
            const newWidth = Math.max(width, CONFIG.WINDOW.MIN_WIDTH);
            const newHeight = Math.max(height, CONFIG.WINDOW.MIN_HEIGHT);

            windowElement.style.width = newWidth + 'px';
            windowElement.style.height = newHeight + 'px';

            // Keep window within viewport
            const rect = windowElement.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                windowElement.style.width = (window.innerWidth - rect.left) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                windowElement.style.height = (window.innerHeight - rect.top) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
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
                const maxY = window.innerHeight - windowElement.offsetHeight - CONFIG.WINDOW.MENU_BAR_HEIGHT;

                currentX = clamp(currentX, 0, maxX);
                currentY = clamp(currentY, 0, maxY);

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
     * Phase 6: Window Management - Proper minimize tracking
     */
    showDesktop() {
        this.windows.forEach(window => {
            if (window.element.style.display !== 'none') {
                this.minimizeWindow(window.id);
            }
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
     * Phase 6: Window Management - Use restoreWindow method
     */
    restoreAllWindows() {
        const minimized = [...this.minimizedWindows];
        minimized.forEach(windowId => {
            this.restoreWindow(windowId);
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Track mouse movement - use capture phase to ensure we catch all events
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        }, { passive: true });
        
        // Also listen on window to catch events outside document
        window.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        }, { passive: true });
        
        // Listen for openApp events from navigation links
        window.addEventListener('openApp', (e) => {
            const appType = e.detail?.appType;
            if (appType) {
                this.openWindow(appType);
            }
        });

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

