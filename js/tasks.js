/**
 * Tasks Module - Handles task management
 */

import { Storage } from './storage.js';
import { API } from './api.js';

export const Tasks = {
    tasks: [],
    selectedTaskId: null,

    // Callbacks
    onTaskSelect: null,
    onTaskChange: null,

    /**
     * Initialize tasks from storage
     */
    init(initialTasks = [], selectedTaskId = null) {
        this.tasks = initialTasks;
        if (selectedTaskId !== null) {
            this.selectedTaskId = selectedTaskId;
        }
    },

    /**
     * Add a new task (async - calls backend API)
     */
    async add(text) {
        const trimmed = text.trim();
        if (!trimmed) return null;

        const newTask = await API.addTask(trimmed);
        if (newTask) {
            this.tasks.push(newTask);
            this.notifyChange();
        }
        return newTask;
    },

    /**
     * Remove a task (async - calls backend API)
     */
    async remove(taskId) {
        const result = await API.deleteTask(taskId);
        if (result) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            
            if (this.selectedTaskId === taskId) {
                this.selectedTaskId = null;
                Storage.saveSelectedTaskId(null);
                if (this.onTaskSelect) {
                    this.onTaskSelect(null);
                }
            }
            
            this.notifyChange();
        }
    },

    /**
     * Select a task
     */
    select(taskId) {
        if (this.selectedTaskId === taskId) return;

        this.selectedTaskId = taskId;
        
        // Save selection to localStorage
        Storage.saveSelectedTaskId(taskId);
        
        if (this.onTaskSelect) {
            const task = this.getTask(taskId);
            this.onTaskSelect(task);
        }
    },

    /**
     * Get a task by ID
     */
    getTask(taskId) {
        return this.tasks.find(t => t.id === taskId) || null;
    },

    /**
     * Get selected task
     */
    getSelectedTask() {
        return this.getTask(this.selectedTaskId);
    },

    /**
     * Increment pomodoro count for selected task (async - calls backend API)
     */
    async incrementPomodoro() {
        if (!this.selectedTaskId) return;

        const updatedTask = await API.incrementPomodoro(this.selectedTaskId);
        if (updatedTask) {
            const task = this.getTask(this.selectedTaskId);
            if (task) {
                task.pomodoroCount = updatedTask.pomodoroCount;
                this.notifyChange();
            }
        }
    },

    /**
     * Get all tasks
     */
    getAll() {
        return this.tasks;
    },

    /**
     * Check if a task is selected
     */
    hasSelection() {
        return this.selectedTaskId !== null;
    },

    /**
     * Notify listeners of task changes
     */
    notifyChange() {
        if (this.onTaskChange) {
            this.onTaskChange(this.tasks);
        }
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
};

