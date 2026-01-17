/**
 * Main App Module - Coordinates all modules and handles initialization
 */

import { Timer } from './timer.js';
import { Tasks } from './tasks.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';

class PomodoroApp {
    constructor() {
        this.sessionHistory = Storage.loadHistory();
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize UI
        UI.init();

        // Initialize Timer
        Timer.init();
        Timer.onTick = (seconds) => {
            UI.updateTimer(Timer.getFormattedTime());
            UI.updateProgress(Timer.getProgress());
        };
        Timer.onSessionEnd = () => {
            this.handleSessionEnd();
        };
        Timer.onStateChange = (state) => {
            UI.updateButtonStates(state.isRunning);
            UI.updateSessionType(Timer.getSessionLabel());
            this.updateTaskLockState(state.isRunning);
        };

        // Initialize Tasks
        const savedTasks = Storage.loadTasks();
        Tasks.init(savedTasks);
        Tasks.onTaskSelect = (task) => {
            UI.updateActiveTask(task);
        };
        Tasks.onTaskChange = (tasks) => {
            Storage.saveTasks(tasks);
            UI.renderTasks(tasks, Tasks.selectedTaskId, Timer.isRunning);
        };

        // Initial UI updates
        UI.updateTimer(Timer.getFormattedTime());
        UI.updateProgress(Timer.getProgress());
        UI.updateSessionType(Timer.getSessionLabel());
        UI.updateActiveTask(Tasks.getSelectedTask());
        UI.renderTasks(Tasks.getAll(), Tasks.selectedTaskId, Timer.isRunning);
        UI.resetPomodoroIndicator();

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Timer controls
        UI.elements.startBtn?.addEventListener("click", () => {
            if (!Tasks.hasSelection()) {
                UI.showAlert("Please select a task before starting the timer");
                return;
            }
            Timer.start();
            UI.updateFocusHint("Focus Mode");
        });

        UI.elements.pauseBtn?.addEventListener("click", () => {
            Timer.pause();
            UI.updateFocusHint("");
        });

        UI.elements.resetBtn?.addEventListener("click", () => {
            Timer.reset();
            UI.updateFocusHint("");
        });

        UI.elements.skipBtn?.addEventListener("click", () => {
            Timer.skip();
        });

        // Task management
        UI.elements.addTaskBtn?.addEventListener("click", () => {
            this.addTask();
        });

        UI.elements.taskInput?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.addTask();
            }
        });

        // Task list interactions
        UI.elements.taskList?.addEventListener("click", (e) => {
            const taskItem = e.target.closest(".task-item");
            if (!taskItem) return;

            const taskId = parseInt(taskItem.getAttribute("data-id"));
            
            // Handle delete button
            if (e.target.classList.contains("task-delete-btn")) {
                Tasks.remove(taskId);
                return;
            }

            // Handle task selection
            if (!Timer.isRunning) {
                Tasks.select(taskId);
                this.updateTaskSelection();
            }
        });
    }

    /**
     * Add a new task
     */
    addTask() {
        const text = UI.getTaskInputValue();
        const task = Tasks.add(text);
        
        if (task) {
            UI.clearTaskInput();
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
        UI.renderTasks(Tasks.getAll(), Tasks.selectedTaskId, Timer.isRunning);
    }

    /**
     * Update task lock state (disable/enable during timer)
     */
    updateTaskLockState(isRunning) {
        UI.renderTasks(Tasks.getAll(), Tasks.selectedTaskId, isRunning);
    }

    /**
     * Handle session end
     */
    handleSessionEnd() {
        // Play notification sound (simple beep)
        this.playNotificationSound();

        // Increment pomodoro count for selected task
        if (Timer.currentSession === "work") {
            Tasks.incrementPomodoro();
        }

        // Update pomodoro indicator
        if (Timer.currentSession === "work") {
            UI.updatePomodoroIndicator(Timer.pomodoroCount);
        }

        // Record session
        if (Timer.currentSession === "work") {
            this.recordSession();
        }

        // Handle session transition
        Timer.handleSessionEnd();
        
        // Update UI
        UI.updateSessionType(Timer.getSessionLabel());
        UI.updateFocusHint(Timer.currentSession === "work" ? "Focus Mode" : "Break Time");
        
        // Unlock tasks
        this.updateTaskLockState(false);
    }

    /**
     * Record completed session
     */
    recordSession() {
        const today = new Date().toISOString().slice(0, 10);
        this.sessionHistory.push({
            date: today,
            type: "work",
            duration: Timer.WORK_DURATION
        });
        Storage.saveHistory(this.sessionHistory);
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        // Simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log("Audio playback not available");
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const app = new PomodoroApp();
    app.init();
});

