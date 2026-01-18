/**
 * Desktop Module - Handles desktop environment
 * Phase 1: Desktop Foundation
 * Phase 2: Custom Cursor
 */

class Desktop {
    constructor() {
        this.cursor = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.cursorState = 'normal';
        this.init();
    }

    /**
     * Initialize desktop
     */
    init() {
        this.initCursor();
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
        // Pointer cursor for clickable elements
        else if (target.closest('button, a, .clickable, .mac-menu-item, .mac-button')) {
            this.updateCursorState('pointer');
        } 
        // Normal arrow cursor for everything else
        else {
            this.updateCursorState('normal');
        }
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
    }
}

// Initialize desktop when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Desktop();
});

