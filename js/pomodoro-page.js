/**
 * Pomodoro Timer Page - Handles timer functionality with task selection
 */

import { Timer } from './timer.js';
import { Tasks } from './tasks.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';

class PomodoroPage {
    constructor() {
        this.sessionHistory = Storage.loadHistory();
    }

    /**
     * Initialize the Pomodoro page
     */
    async init() {
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

        // Initialize Tasks from backend API
        const savedTasks = await Storage.loadTasks();
        const selectedTaskId = Storage.loadSelectedTaskId();
        Tasks.init(savedTasks, selectedTaskId);
        Tasks.onTaskSelect = (task) => {
            UI.updateActiveTask(task);
        };
        Tasks.onTaskChange = (tasks) => {
            Storage.saveTasks(tasks);
            // Don't render full task list on pomodoro page, just update active task
        };

        // Initial UI updates
        UI.updateTimer(Timer.getFormattedTime());
        UI.updateProgress(Timer.getProgress());
        UI.updateSessionType(Timer.getSessionLabel());
        UI.updateActiveTask(Tasks.getSelectedTask());
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
                UI.showAlert("Please select a task from the Todo page before starting the timer");
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
    }

    /**
     * Update task lock state (disable/enable during timer)
     */
    updateTaskLockState(isRunning) {
        // Tasks are managed on the todo page, so we just update the display
        const selectedTask = Tasks.getSelectedTask();
        UI.updateActiveTask(selectedTask);
    }

    /**
     * Handle session end
     */
    async handleSessionEnd() {
        // Play notification sound
        this.playNotificationSound();

        // Increment pomodoro count for selected task
        if (Timer.currentSession === "work") {
            await Tasks.incrementPomodoro();
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

// Initialize page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const page = new PomodoroPage();
    page.init();
});

