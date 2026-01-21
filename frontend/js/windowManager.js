/**
 * Window Manager - Handles window creation, dragging, focus, z-index
 * Extracted from desktop.js for better organization
 */

import { CONFIG } from './config.js?v=10';
import { clamp } from './utils.js?v=10';

export class WindowManager {
    constructor() {
        this.windows = [];
        this.windowZIndex = CONFIG.WINDOW.INITIAL_Z_INDEX || 101;
        this.activeWindowId = null;
        this.minimizedWindows = [];
    }

    /**
     * Open a window for an app
     * @param {string} appType - Type of app to open
     * @param {Function} getAppContent - Function to get app HTML content
     * @param {Function} initApp - Function to initialize app JavaScript
     */
    openWindow(appType, getAppContent, initApp) {
        // Check if window already exists for this app
        const existingWindow = this.windows.find(w => w.appType === appType);
        if (existingWindow) {
            this.focusWindow(existingWindow.id);
            return existingWindow.id;
        }

        // Create new window
        const windowId = `window-${Date.now()}`;
        const window = this.createWindow(windowId, appType, getAppContent);
        
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

        // Initialize app JavaScript
        if (initApp) {
            initApp(window, appType);
        }

        // Focus the new window
        this.focusWindow(windowId);

        return windowId;
    }

    /**
     * Create window element
     */
    createWindow(id, appType, getAppContent) {
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
        const appContent = getAppContent ? getAppContent(appType) : '<div class="mac-content"><p>Loading...</p></div>';

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

        return window;
    }

    /**
     * Focus a window (bring to front)
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
     * Show desktop (minimize all windows)
     */
    showDesktop() {
        this.windows.forEach(window => {
            if (window.element.style.display !== 'none') {
                this.minimizeWindow(window.id);
            }
        });
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
}
