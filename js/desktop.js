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
     * Update cursor state (normal, pointer, text)
     */
    updateCursorState(newState) {
        if (!this.cursor || this.cursorState === newState) return;
        
        this.cursor.className = `mac-cursor mac-cursor-${newState}`;
        this.cursorState = newState;
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
        // Pointer cursor for clickable elements (including desktop icons)
        else if (target.closest('button, a, .clickable, .mac-menu-item, .mac-button, .desktop-icon')) {
            this.updateCursorState('pointer');
        } 
        // Normal arrow cursor for everything else
        else {
            this.updateCursorState('normal');
        }
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
        
        // Handle app launch (will be implemented in Phase 4)
        console.log(`Launching app: ${appType}`);
        
        // For now, just show feedback
        setTimeout(() => {
            icon.classList.remove('selected');
            this.selectedIcon = null;
        }, 200);
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

