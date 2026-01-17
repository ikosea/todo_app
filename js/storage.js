/**
 * Storage Module - Handles localStorage and API operations
 */
import { API } from './api.js';

export const Storage = {
    /**
     * Load tasks from backend API
     */
    async loadTasks() {
        return await API.getTasks();
    },

    /**
     * Save tasks - now handled by API (no need to save all tasks)
     */
    saveTasks(tasks) {
        // Tasks are saved individually via API, this is kept for compatibility
    },

    /**
     * Save session history
     */
    saveHistory(history) {
        localStorage.setItem("pomodoroHistory", JSON.stringify(history));
    },

    /**
     * Load session history
     */
    loadHistory() {
        const saved = localStorage.getItem("pomodoroHistory");
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Save selected task ID
     */
    saveSelectedTaskId(taskId) {
        if (taskId !== null) {
            localStorage.setItem("selectedTaskId", taskId.toString());
        } else {
            localStorage.removeItem("selectedTaskId");
        }
    },

    /**
     * Load selected task ID
     */
    loadSelectedTaskId() {
        const saved = localStorage.getItem("selectedTaskId");
        return saved ? parseInt(saved) : null;
    }
};

