/**
 * Trash Module - Deleted tasks management
 * Handles viewing, restoring, and permanently deleting tasks
 */

import { API } from './api.js';
import { CONFIG } from './config.js';

export class Trash {
    /**
     * Initialize Trash app in a window
     * @param {HTMLElement} windowElement - The window element
     */
    static async init(windowElement) {
        await Trash.loadTrash(windowElement);
        Trash.setupEventListeners(windowElement);
        // Listen for trash updates
        window.addEventListener('trashUpdated', () => {
            Trash.loadTrash(windowElement);
        });
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners(windowElement) {
        const emptyBtn = windowElement.querySelector('#empty-trash-btn');
        if (emptyBtn) {
            emptyBtn.addEventListener('click', () => {
                Trash.emptyTrash(windowElement);
            });
        }
    }

    /**
     * Load trash items from localStorage
     */
    static async loadTrash(windowElement) {
        const trash = Trash.getTrash();
        Trash.renderTrash(windowElement, trash);
    }

    /**
     * Get trash items from localStorage
     */
    static getTrash() {
        const trashStr = localStorage.getItem('trash');
        return trashStr ? JSON.parse(trashStr) : [];
    }

    /**
     * Save trash items to localStorage
     */
    static saveTrash(trash) {
        localStorage.setItem('trash', JSON.stringify(trash));
    }

    /**
     * Render trash items to the DOM
     */
    static renderTrash(windowElement, trashItems) {
        const trashList = windowElement.querySelector('#trash-list');
        const emptyState = windowElement.querySelector('#trash-empty-state');

        if (!trashList) return;

        // Clear existing items
        trashList.innerHTML = '';

        if (trashItems.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Render trash items (newest first)
        trashItems.slice().reverse().forEach(item => {
            const trashItem = Trash.createTrashElement(windowElement, item);
            trashList.appendChild(trashItem);
        });
    }

    /**
     * Create a trash item element
     */
    static createTrashElement(windowElement, item) {
        const li = document.createElement('li');
        li.className = 'task-item';

        // Task text
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = item.text;
        textSpan.style.textDecoration = 'line-through';
        textSpan.style.opacity = '0.7';

        // Task info (date and pomodoro count)
        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-info';

        const pomodoroSpan = document.createElement('span');
        pomodoroSpan.className = 'task-pomodoros';
        pomodoroSpan.textContent = `🍅 ${item.pomodoroCount || 0}`;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        const deletedDate = new Date(item.deletedAt);
        dateSpan.textContent = `Deleted: ${deletedDate.toLocaleDateString()}`;
        dateSpan.style.fontSize = '10px';
        dateSpan.style.color = '#808080';
        dateSpan.style.marginLeft = '8px';

        infoDiv.appendChild(pomodoroSpan);
        infoDiv.appendChild(dateSpan);

        // Restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'mac-button';
        restoreBtn.textContent = 'Restore';
        restoreBtn.style.marginRight = '4px';
        restoreBtn.addEventListener('click', () => Trash.restoreTask(windowElement, item));

        // Permanent delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'mac-button';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => Trash.permanentDelete(windowElement, item));

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '4px';
        buttonContainer.appendChild(restoreBtn);
        buttonContainer.appendChild(deleteBtn);

        // Assemble trash item
        li.appendChild(textSpan);
        li.appendChild(infoDiv);
        li.appendChild(buttonContainer);

        return li;
    }

    /**
     * Restore a task from trash
     */
    static async restoreTask(windowElement, item) {
        try {
            // Add task back via API
            const restoredTask = await API.addTask(item.text);
            
            if (restoredTask) {
                // Remove from trash
                const trash = Trash.getTrash();
                const updatedTrash = trash.filter(t => t.id !== item.id);
                Trash.saveTrash(updatedTrash);
                
                await Trash.loadTrash(windowElement);
                // Notify other windows
                window.dispatchEvent(new CustomEvent('tasksUpdated'));
                window.dispatchEvent(new CustomEvent('trashUpdated'));
            }
        } catch (error) {
            console.error('Error restoring task:', error);
            alert('Failed to restore task. Please try again.');
        }
    }

    /**
     * Permanently delete a task from trash
     */
    static permanentDelete(windowElement, item) {
        if (confirm('Permanently delete this task? This cannot be undone.')) {
            const trash = Trash.getTrash();
            const updatedTrash = trash.filter(t => t.id !== item.id);
            Trash.saveTrash(updatedTrash);
            
            Trash.loadTrash(windowElement);
            window.dispatchEvent(new CustomEvent('trashUpdated'));
        }
    }

    /**
     * Empty the entire trash
     */
    static emptyTrash(windowElement) {
        if (confirm('Permanently delete all items in trash? This cannot be undone.')) {
            Trash.saveTrash([]);
            Trash.loadTrash(windowElement);
            window.dispatchEvent(new CustomEvent('trashUpdated'));
        }
    }
}

