/**
 * Desktop Module - Handles desktop environment
 * Phase 1: Desktop Foundation
 * Phase 2: Custom Cursor
 * Phase 3: Desktop Icons
 */

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
     * Handle icon click
     */
    handleIconClick(e, icon) {
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
        
        // Launch app window
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
            'folder': 'Folder',
            'trash': 'Trash'
        };
        const title = titles[appType] || 'Window';

        window.innerHTML = `
            <header class="mac-titlebar">
                <div class="mac-titlebar-controls">
                    <span class="mac-close" data-window-id="${id}"></span>
                    <span class="mac-minimize" data-window-id="${id}"></span>
                    <span class="mac-maximize" data-window-id="${id}"></span>
                </div>
                <h1 class="mac-title">${title}</h1>
            </header>
            <div class="mac-content">
                <p>${title} content will be loaded here.</p>
                <p>This is a placeholder window.</p>
            </div>
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
    }
}

// Initialize desktop when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Desktop();
});

