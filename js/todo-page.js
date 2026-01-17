/**
 * Todo & Dashboard Page - Handles task management and statistics
 */

import { Tasks } from './tasks.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';

class TodoPage {
    constructor() {
        this.sessionHistory = Storage.loadHistory();
    }

    /**
     * Initialize the Todo page
     */
    init() {
        // Initialize UI
        UI.init();

        // Initialize Tasks
        const savedTasks = Storage.loadTasks();
        const selectedTaskId = Storage.loadSelectedTaskId();
        Tasks.init(savedTasks, selectedTaskId);
        Tasks.onTaskSelect = (task) => {
            // Update selection in UI
            this.updateTaskSelection();
        };
        Tasks.onTaskChange = (tasks) => {
            Storage.saveTasks(tasks);
            UI.renderTasks(tasks, Tasks.selectedTaskId, false);
        };

        // Initial UI updates
        UI.renderTasks(Tasks.getAll(), Tasks.selectedTaskId, false);
        this.updateStats();

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Task management
        const addBtn = document.getElementById("add-task");
        const taskInput = document.getElementById("task-input");
        
        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addTask();
            });
        } else {
            console.error("Add task button not found");
        }

        if (taskInput) {
            taskInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.addTask();
                }
            });
        } else {
            console.error("Task input not found");
        }

        // Task list interactions
        UI.elements.taskList?.addEventListener("click", (e) => {
            const taskItem = e.target.closest(".task-item");
            if (!taskItem) return;

            const taskId = parseInt(taskItem.getAttribute("data-id"));
            
            // Handle delete button
            if (e.target.classList.contains("task-delete-btn")) {
                Tasks.remove(taskId);
                this.updateStats();
                return;
            }

            // Handle task selection
            Tasks.select(taskId);
            this.updateTaskSelection();
        });
    }

    /**
     * Add a new task
     */
    addTask() {
        const taskInput = document.getElementById("task-input");
        const text = taskInput ? taskInput.value.trim() : "";
        
        if (!text) {
            return;
        }
        
        const task = Tasks.add(text);
        
        if (task) {
            if (taskInput) {
                taskInput.value = "";
            }
            // Auto-select the new task if none selected
            if (!Tasks.hasSelection()) {
                Tasks.select(task.id);
                this.updateTaskSelection();
            }
        }
    }

    /**
     * Update task selection in UI
     */
    updateTaskSelection() {
        UI.renderTasks(Tasks.getAll(), Tasks.selectedTaskId, false);
    }

    /**
     * Update dashboard statistics
     */
    updateStats() {
        const todayEl = document.getElementById("today-count");
        const weekEl = document.getElementById("week-count");
        const minutesEl = document.getElementById("focus-minutes");

        if (!todayEl || !weekEl || !minutesEl) return;

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        let todayCount = 0;
        let weekCount = 0;
        let minutes = 0;

        this.sessionHistory.forEach(s => {
            const sessionDate = new Date(s.date);

            if (s.date === todayStr) todayCount++;
            if (sessionDate >= weekStart) weekCount++;

            minutes += s.duration;
        });

        todayEl.textContent = todayCount;
        weekEl.textContent = weekCount;
        minutesEl.textContent = minutes;
    }
}

// Initialize page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const page = new TodoPage();
    page.init();
});

