/**
 * Tasks Module - Handles task management
 */

export const Tasks = {
    tasks: [],
    selectedTaskId: null,

    // Callbacks
    onTaskSelect: null,
    onTaskChange: null,

    /**
     * Initialize tasks from storage
     */
    init(initialTasks = []) {
        this.tasks = initialTasks;
    },

    /**
     * Add a new task
     */
    add(text) {
        const trimmed = text.trim();
        if (!trimmed) return null;

        const newTask = {
            id: Date.now(),
            text: trimmed,
            completed: false,
            pomodoroCount: 0
        };

        this.tasks.push(newTask);
        this.notifyChange();
        return newTask;
    },

    /**
     * Remove a task
     */
    remove(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        if (this.selectedTaskId === taskId) {
            this.selectedTaskId = null;
            if (this.onTaskSelect) {
                this.onTaskSelect(null);
            }
        }
        
        this.notifyChange();
    },

    /**
     * Select a task
     */
    select(taskId) {
        if (this.selectedTaskId === taskId) return;

        this.selectedTaskId = taskId;
        
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
     * Increment pomodoro count for selected task
     */
    incrementPomodoro() {
        if (!this.selectedTaskId) return;

        const task = this.getTask(this.selectedTaskId);
        if (task) {
            task.pomodoroCount++;
            this.notifyChange();
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

