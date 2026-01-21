/**
 * Desktop Module - Handles desktop environment
 * Manages desktop UI, icons, cursor, and coordinates with WindowManager
 */

// NOTE: We add a cache-busting query to module imports to avoid aggressive caching (notably in Edge)
// when running via simple static servers (e.g., python http.server) that don't set cache headers.
import { WindowManager } from './windowManager.js?v=9';
import { WindowApps } from './windowApps.js?v=9';
import { CONFIG } from './config.js?v=9';
import { API } from './api.js?v=9';
import { delay, clamp } from './utils.js?v=9';

class Desktop {
    constructor() {
        this.cursor = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.cursorState = 'normal';
        this.selectedIcon = null;
        this.windowManager = new WindowManager();
        this.init();
        this.initOfflineSupport();
    }

    /**
     * Initialize offline support
     */
    async initOfflineSupport() {
        try {
            const { OfflineManager } = await import('./offline.js');
            await OfflineManager.init();
            OfflineManager.setupListeners();
            
            // Sync when back online
            window.addEventListener('onlineStatusChanged', async (e) => {
                if (e.detail.online) {
                    await OfflineManager.syncPending();
                    // Refresh tasks
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                }
            });
        } catch (error) {
            console.warn('Offline support initialization failed:', error);
        }
    }

    /**
     * Initialize desktop
     */
    init() {
        this.initCursor();
        this.initIcons();
        this.initMenuBar();
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

        // Menu actions are handled in initMenuBar() for better event handling
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
     * Initialize menu bar dropdowns
     */
    initMenuBar() {
        // File menu
        const fileMenu = document.getElementById('desktop-file-menu');
        if (fileMenu) {
            fileMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                fileMenu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!fileMenu.contains(e.target)) {
                    fileMenu.classList.remove('active');
                }
            });

            // File menu handlers
            const exportData = document.getElementById('export-data');
            const importData = document.getElementById('import-data');

            if (exportData) {
                exportData.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleExportData();
                    fileMenu.classList.remove('active');
                });
            }

            if (importData) {
                importData.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleImportData();
                    fileMenu.classList.remove('active');
                });
            }
        }

        // Special menu
        const specialMenu = document.getElementById('desktop-special-menu');
        if (specialMenu) {
            specialMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                specialMenu.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!specialMenu.contains(e.target)) {
                    specialMenu.classList.remove('active');
                }
            });

            // Setup dropdown item click handlers
            const showDesktop = document.getElementById('show-desktop');
            const closeAllWindows = document.getElementById('close-all-windows');
            const logoutBtn = document.getElementById('logout');

            if (showDesktop) {
                showDesktop.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.windowManager.showDesktop();
                    specialMenu.classList.remove('active');
                });
            }

            if (closeAllWindows) {
                closeAllWindows.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.windowManager.windows.forEach(w => {
                        this.windowManager.closeWindow(w.id);
                    });
                    specialMenu.classList.remove('active');
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleLogout();
                    specialMenu.classList.remove('active');
                });
            }
        }
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

    /**
     * Handle export data
     */
    async handleExportData() {
        try {
            const tasks = await API.getTasks();
            const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
            const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE.CURRENT_USER) || '{}');
            
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                user: {
                    username: user.username,
                    email: user.email
                },
                tasks: tasks,
                sessionHistory: sessionHistory,
                settings: {
                    selectedTask: localStorage.getItem(CONFIG.STORAGE.SELECTED_TASK)
                }
            };

            // Create and download JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `productivity-app-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('Data exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data: ' + error.message);
        }
    }

    /**
     * Handle import data
     */
    async handleImportData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importData = JSON.parse(text);

                if (!importData.tasks || !importData.sessionHistory) {
                    throw new Error('Invalid export file format');
                }

                if (!confirm('Importing data will replace your current tasks and session history. Continue?')) {
                    return;
                }

                // Import tasks
                for (const task of importData.tasks) {
                    try {
                        await API.addTask(task.text || task.name);
                    } catch (error) {
                        console.warn('Failed to import task:', task, error);
                    }
                }

                // Import session history
                localStorage.setItem('sessionHistory', JSON.stringify(importData.sessionHistory));

                // Import settings
                if (importData.settings?.selectedTask) {
                    localStorage.setItem(CONFIG.STORAGE.SELECTED_TASK, importData.settings.selectedTask);
                }

                alert('Data imported successfully! Please refresh the page.');
                window.location.reload();
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import data: ' + error.message);
            }
        };

        input.click();
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            // API.logout() will handle the redirect
            API.logout();
        }
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

