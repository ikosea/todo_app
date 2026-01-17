/**
 * UI Module - Handles DOM updates and rendering
 */

export const UI = {
    // DOM Elements
    elements: {},

    /**
     * Initialize DOM element references
     */
    init() {
        this.elements = {
            timer: document.getElementById("timer"),
            sessionType: document.getElementById("session-type"),
            progressBar: document.getElementById("progress-bar"),
            activeTaskText: document.getElementById("active-task-text"),
            focusHint: document.getElementById("focus-hint"),
            startBtn: document.getElementById("start-btn"),
            pauseBtn: document.getElementById("pause-btn"),
            resetBtn: document.getElementById("reset-btn"),
            skipBtn: document.getElementById("skip-btn"),
            taskInput: document.getElementById("task-input"),
            addTaskBtn: document.getElementById("add-task"),
            taskList: document.getElementById("task-list"),
            circles: {
                1: document.getElementById("circle-1"),
                2: document.getElementById("circle-2"),
                3: document.getElementById("circle-3"),
                4: document.getElementById("circle-4")
            }
        };
    },

    /**
     * Update timer display
     */
    updateTimer(timeString) {
        if (this.elements.timer) {
            this.elements.timer.textContent = timeString;
        }
    },

    /**
     * Update session type label
     */
    updateSessionType(label) {
        if (this.elements.sessionType) {
            this.elements.sessionType.textContent = label;
        }
    },

    /**
     * Update progress bar
     */
    updateProgress(percentage) {
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = percentage + "%";
        }
    },

    /**
     * Update active task display
     */
    updateActiveTask(task) {
        if (this.elements.activeTaskText) {
            this.elements.activeTaskText.textContent = task 
                ? task.text 
                : "No task selected";
        }
    },

    /**
     * Update focus hint
     */
    updateFocusHint(text) {
        if (this.elements.focusHint) {
            this.elements.focusHint.textContent = text || "";
        }
    },

    /**
     * Update button states based on timer state
     */
    updateButtonStates(isRunning) {
        if (this.elements.startBtn && this.elements.pauseBtn) {
            if (isRunning) {
                this.elements.startBtn.style.display = "none";
                this.elements.pauseBtn.style.display = "inline-block";
            } else {
                this.elements.startBtn.style.display = "inline-block";
                this.elements.pauseBtn.style.display = "none";
            }
        }
    },

    /**
     * Render task list
     */
    renderTasks(tasks, selectedTaskId, isRunning) {
        if (!this.elements.taskList) return;

        this.elements.taskList.innerHTML = "";

        if (tasks.length === 0) {
            const empty = document.createElement("li");
            empty.className = "empty-state";
            empty.textContent = "No tasks yet. Add one to get started!";
            this.elements.taskList.appendChild(empty);
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = "task-item";
            
            if (task.id === selectedTaskId) {
                li.classList.add("selected");
            }
            
            if (isRunning && task.id !== selectedTaskId) {
                li.classList.add("disabled");
            }

            li.setAttribute("data-id", task.id);

            const span = document.createElement("span");
            let text = this.escapeHtml(task.text);
            if (task.pomodoroCount > 0) {
                text += ` (${task.pomodoroCount})`;
            }
            span.textContent = text;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "task-delete-btn";
            deleteBtn.textContent = "✕";
            deleteBtn.setAttribute("data-id", task.id);

            li.appendChild(span);
            li.appendChild(deleteBtn);
            this.elements.taskList.appendChild(li);
        });
    },

    /**
     * Update pomodoro indicator circles
     */
    updatePomodoroIndicator(count) {
        for (let i = 1; i <= 4; i++) {
            const circle = this.elements.circles[i];
            if (circle) {
                if (i <= count) {
                    circle.classList.add("filled");
                } else {
                    circle.classList.remove("filled");
                }
            }
        }
    },

    /**
     * Reset pomodoro indicator
     */
    resetPomodoroIndicator() {
        this.updatePomodoroIndicator(0);
    },

    /**
     * Clear task input
     */
    clearTaskInput() {
        if (this.elements.taskInput) {
            this.elements.taskInput.value = "";
        }
    },

    /**
     * Get task input value
     */
    getTaskInputValue() {
        return this.elements.taskInput ? this.elements.taskInput.value : "";
    },

    /**
     * Show alert (Mac-style)
     */
    showAlert(message) {
        alert(message);
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
};

