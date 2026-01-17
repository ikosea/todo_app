/**
 * Timer Module - Handles Pomodoro timer logic and state
 */

export const Timer = {
    // Constants
    WORK_DURATION: 25,
    SHORT_BREAK_DURATION: 5,
    LONG_BREAK_DURATION: 15,

    // State
    timerSeconds: 25 * 60,
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
     */
    getSessionDuration(type) {
        if (type === "work") return this.WORK_DURATION;
        if (type === "short") return this.SHORT_BREAK_DURATION;
        if (type === "long") return this.LONG_BREAK_DURATION;
        return this.WORK_DURATION;
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
            
            // Reset after 4 pomodoros
            if (this.sessionsCompleted % 4 === 0) {
                this.pomodoroCount = 0;
            }
            
            // Switch to break
            this.currentSession = (this.sessionsCompleted % 4 === 0) ? "long" : "short";
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
     */
    getFormattedTime() {
        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },

    /**
     * Get progress percentage
     */
    getProgress() {
        const duration = this.getSessionDuration(this.currentSession) * 60;
        const elapsed = duration - this.timerSeconds;
        return Math.max(0, Math.min(100, (elapsed / duration) * 100));
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

