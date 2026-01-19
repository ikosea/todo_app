/**
 * Timer Module - Handles Pomodoro timer logic and state
 */

import { CONFIG } from './config.js';
import { formatTime, clamp } from './utils.js';

export const Timer = {
    // State
    timerSeconds: CONFIG.TIMER.WORK_DURATION * 60,
    timerInterval: null,
    isRunning: false,
    currentSession: "work",
    sessionsCompleted: 0,
    pomodoroCount: 0,

    // Callbacks
    onTick: null,
    onSessionEnd: null,
    onStateChange: null,

    /**
     * Initialize timer
     */
    init() {
        this.timerSeconds = this.getSessionDuration(this.currentSession) * 60;
    },

    /**
     * Get duration for session type
     * @param {string} type - Session type ('work', 'short', 'long')
     * @returns {number} Duration in minutes
     */
    getSessionDuration(type) {
        const durations = {
            "work": CONFIG.TIMER.WORK_DURATION,
            "short": CONFIG.TIMER.SHORT_BREAK_DURATION,
            "long": CONFIG.TIMER.LONG_BREAK_DURATION
        };
        return durations[type] || CONFIG.TIMER.WORK_DURATION;
    },

    /**
     * Start the timer
     */
    start() {
        if (this.isRunning) return false;

        this.isRunning = true;
        this.notifyStateChange();

        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            
            if (this.onTick) {
                this.onTick(this.timerSeconds);
            }

            if (this.timerSeconds <= 0) {
                this.stop();
                if (this.onSessionEnd) {
                    this.onSessionEnd();
                }
            }
        }, 1000);

        return true;
    },

    /**
     * Pause the timer
     */
    pause() {
        this.stop();
    },

    /**
     * Stop the timer interval
     */
    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isRunning = false;
        this.notifyStateChange();
    },

    /**
     * Reset timer to current session duration
     */
    reset() {
        this.stop();
        this.timerSeconds = this.getSessionDuration(this.currentSession) * 60;
        if (this.onTick) {
            this.onTick(this.timerSeconds);
        }
    },

    /**
     * Skip current session
     */
    skip() {
        this.stop();
        if (this.onSessionEnd) {
            this.onSessionEnd();
        }
    },

    /**
     * Handle session end logic
     */
    handleSessionEnd() {
        if (this.currentSession === "work") {
            this.pomodoroCount++;
            this.sessionsCompleted++;
            
            // Reset after configured number of pomodoros
            if (this.sessionsCompleted % CONFIG.TIMER.POMODOROS_PER_LONG_BREAK === 0) {
                this.pomodoroCount = 0;
            }
            
            // Switch to break
            this.currentSession = (this.sessionsCompleted % CONFIG.TIMER.POMODOROS_PER_LONG_BREAK === 0) ? "long" : "short";
        } else {
            // Switch back to work
            this.currentSession = "work";
        }

        this.timerSeconds = this.getSessionDuration(this.currentSession) * 60;
        if (this.onTick) {
            this.onTick(this.timerSeconds);
        }
    },

    /**
     * Get formatted time string (MM:SS)
     * @returns {string} Formatted time
     */
    getFormattedTime() {
        return formatTime(this.timerSeconds);
    },

    /**
     * Get progress percentage
     * @returns {number} Progress percentage (0-100)
     */
    getProgress() {
        const duration = this.getSessionDuration(this.currentSession) * 60;
        const elapsed = duration - this.timerSeconds;
        return clamp((elapsed / duration) * 100, 0, 100);
    },

    /**
     * Get session type label
     */
    getSessionLabel() {
        if (this.currentSession === "work") return "Work Session";
        if (this.currentSession === "short") return "Short Break";
        return "Long Break";
    },

    /**
     * Notify state change
     */
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange({
                isRunning: this.isRunning,
                currentSession: this.currentSession
            });
        }
    }
};

