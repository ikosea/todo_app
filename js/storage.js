/**
 * Storage Module - Handles localStorage operations
 */
export const Storage = {
    /**
     * Save tasks to localStorage
     */
    saveTasks(tasks) {
        localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
    },

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        const saved = localStorage.getItem("pomodoroTasks");
        return saved ? JSON.parse(saved) : [];
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

