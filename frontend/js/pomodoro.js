/**
 * Pomodoro Module - Timer and session tracking
 * Handles 25min focus, 5min short break, 15min long break
 * Tracks 4 tomato blocks and session history
 */

import { API } from './api.js';
import { CONFIG } from './config.js';
import { formatTime } from './utils.js';

export class Pomodoro {
    constructor(windowElement) {
        this.windowElement = windowElement;
        this.timerState = {
            seconds: CONFIG.TIMER.WORK_DURATION * 60,
            isRunning: false,
            intervalId: null,
            currentMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
            pomodorosCompleted: 0,
            tomatoesFilled: 0
        };
        this.selectedTaskId = null;
    }

    /**
     * Initialize Pomodoro app
     */
    async init() {
        try {
            this.loadSavedState();
            await this.loadTasks();
            this.setupEventListeners();
            this.setupNavigationLinks();
            // Ensure timer displays correctly on init
            this.updateTimerDisplay();
            this.updateTomatoes();
            this.updateUI();
            // Listen for task updates from other windows
            window.addEventListener('tasksUpdated', () => {
                this.loadTasks();
            });
        } catch (error) {
            console.error('Error initializing Pomodoro:', error);
        }
    }

    /**
     * Load saved state from localStorage
     */
    loadSavedState() {
        const saved = localStorage.getItem('pomodoroState');
        if (saved) {
            const state = JSON.parse(saved);
            this.timerState.seconds = state.seconds || CONFIG.TIMER.WORK_DURATION * 60;
            this.timerState.currentMode = state.currentMode || 'focus';
            this.timerState.pomodorosCompleted = state.pomodorosCompleted || 0;
            this.timerState.tomatoesFilled = state.tomatoesFilled || 0;
            this.selectedTaskId = state.selectedTaskId || null;
            this.updateTomatoes();
        }
    }

    /**
     * Save current state to localStorage
     */
    saveState() {
        const state = {
            seconds: this.timerState.seconds,
            currentMode: this.timerState.currentMode,
            pomodorosCompleted: this.timerState.pomodorosCompleted,
            tomatoesFilled: this.timerState.tomatoesFilled,
            selectedTaskId: this.selectedTaskId
        };
        localStorage.setItem('pomodoroState', JSON.stringify(state));
    }

    /**
     * Load tasks from backend and populate dropdown
     */
    async loadTasks() {
        try {
            const tasks = await API.getTasks();
            const select = this.windowElement.querySelector('#task-select');
            
            if (!select) return;

            // Clear existing options except the first one
            select.innerHTML = '<option value="">-- No task selected --</option>';
            
            // Add tasks
            tasks.forEach(task => {
                if (!task.completed) {
                    const option = document.createElement('option');
                    option.value = task.id;
                    option.textContent = task.text;
                    if (task.id === this.selectedTaskId) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const startBtn = this.windowElement.querySelector('#start-btn');
        const pauseBtn = this.windowElement.querySelector('#pause-btn');
        const resetBtn = this.windowElement.querySelector('#reset-btn');
        const skipBtn = this.windowElement.querySelector('#skip-btn');
        const taskSelect = this.windowElement.querySelector('#task-select');
        const addTaskBtn = this.windowElement.querySelector('#add-task-btn');

        if (startBtn) startBtn.addEventListener('click', () => this.startTimer());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseTimer());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetTimer());
        if (skipBtn) skipBtn.addEventListener('click', () => this.skipSession());
        if (taskSelect) taskSelect.addEventListener('change', (e) => this.handleTaskSelect(e));
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('openApp', { 
                    detail: { appType: 'todo' } 
                }));
            });
        }
    }

    /**
     * Setup navigation links
     */
    setupNavigationLinks() {
        const navLinks = this.windowElement.querySelectorAll('[data-open-app]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const appType = link.getAttribute('data-open-app');
                if (appType) {
                    window.dispatchEvent(new CustomEvent('openApp', { 
                        detail: { appType } 
                    }));
                }
            });
        });
    }

    /**
     * Handle task selection
     */
    handleTaskSelect(e) {
        this.selectedTaskId = e.target.value ? parseInt(e.target.value) : null;
        this.saveState();
        this.updateStartButton();
    }

    /**
     * Start the timer
     */
    startTimer() {
        if (!this.selectedTaskId && this.timerState.currentMode === 'focus') {
            alert('Please select a task first!');
            return;
        }
        
        if (this.timerState.isRunning) return;
        
        this.timerState.isRunning = true;
        this.timerState.intervalId = setInterval(() => {
            this.timerState.seconds--;
            this.updateTimerDisplay();
            this.saveState();
            
            if (this.timerState.seconds <= 0) {
                this.handleSessionEnd();
            }
        }, 1000);
        
        this.updateUI();
    }

    /**
     * Pause the timer
     */
    pauseTimer() {
        if (this.timerState.intervalId) {
            clearInterval(this.timerState.intervalId);
            this.timerState.intervalId = null;
        }
        this.timerState.isRunning = false;
        this.updateUI();
        this.saveState();
    }

    /**
     * Reset the timer
     */
    resetTimer() {
        this.pauseTimer();
        
        // Reset to current mode duration
        if (this.timerState.currentMode === 'focus') {
            this.timerState.seconds = CONFIG.TIMER.WORK_DURATION * 60;
        } else if (this.timerState.currentMode === 'shortBreak') {
            this.timerState.seconds = CONFIG.TIMER.SHORT_BREAK_DURATION * 60;
        } else {
            this.timerState.seconds = CONFIG.TIMER.LONG_BREAK_DURATION * 60;
        }
        
        this.updateTimerDisplay();
        this.saveState();
    }

    /**
     * Skip current session
     */
    skipSession() {
        this.pauseTimer();
        this.handleSessionEnd();
    }

    /**
     * Handle session end
     */
    async handleSessionEnd() {
        this.pauseTimer();
        
        // Play notification sound
        this.playNotification();
        
        if (this.timerState.currentMode === 'focus') {
            // Complete a Pomodoro
            this.timerState.pomodorosCompleted++;
            this.timerState.tomatoesFilled++;
            
            // Save session to history
            this.saveSessionToHistory();
            
            // Increment task pomodoro count via backend
            if (this.selectedTaskId) {
                try {
                    await API.incrementPomodoro(this.selectedTaskId);
                    await this.loadTasks(); // Refresh task list
                    // Notify other windows that tasks have changed
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                } catch (error) {
                    console.error('Error incrementing pomodoro:', error);
                }
            }
            
            // Check if we need long break (after 4 pomodoros)
            if (this.timerState.tomatoesFilled >= CONFIG.TIMER.POMODOROS_PER_LONG_BREAK) {
                this.timerState.currentMode = 'longBreak';
                this.timerState.seconds = CONFIG.TIMER.LONG_BREAK_DURATION * 60;
                this.timerState.tomatoesFilled = 0; // Reset tomatoes
            } else {
                this.timerState.currentMode = 'shortBreak';
                this.timerState.seconds = CONFIG.TIMER.SHORT_BREAK_DURATION * 60;
            }
            
            this.updateTomatoes();
        } else {
            // Break ended, go back to focus
            this.timerState.currentMode = 'focus';
            this.timerState.seconds = CONFIG.TIMER.WORK_DURATION * 60;
        }
        
        this.updateUI();
        this.saveState();
        this.updateTimerDisplay();
    }

    /**
     * Save session to history
     */
    saveSessionToHistory() {
        const history = this.getSessionHistory();
        const today = new Date().toISOString().split('T')[0];
        
        // Find or create today's entry
        let todayEntry = history.find(entry => entry.date === today);
        if (!todayEntry) {
            todayEntry = {
                date: today,
                pomodoros: 0,
                focusTime: 0,
                breakTime: 0
            };
            history.push(todayEntry);
        }
        
        // Update today's entry
        todayEntry.pomodoros++;
        todayEntry.focusTime += CONFIG.TIMER.WORK_DURATION; // 25 minutes
        
        // Save back to localStorage
        localStorage.setItem('sessionHistory', JSON.stringify(history));
        
        // Notify other windows that session data has changed
        window.dispatchEvent(new CustomEvent('sessionUpdated'));
    }

    /**
     * Get session history from localStorage
     */
    getSessionHistory() {
        const saved = localStorage.getItem('sessionHistory');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timerEl = this.windowElement.querySelector('#timer');
        const progressBar = this.windowElement.querySelector('#progress-bar');
        
        if (timerEl) {
            timerEl.textContent = formatTime(this.timerState.seconds);
        }
        
        if (progressBar) {
            const totalSeconds = this.getModeDuration(this.timerState.currentMode) * 60;
            const progress = ((totalSeconds - this.timerState.seconds) / totalSeconds) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * Get duration for mode in minutes
     */
    getModeDuration(mode) {
        if (mode === 'focus') return CONFIG.TIMER.WORK_DURATION;
        if (mode === 'shortBreak') return CONFIG.TIMER.SHORT_BREAK_DURATION;
        return CONFIG.TIMER.LONG_BREAK_DURATION;
    }

    /**
     * Update tomatoes display
     */
    updateTomatoes() {
        for (let i = 1; i <= 4; i++) {
            const tomato = this.windowElement.querySelector(`#tomato-${i}`);
            if (tomato) {
                if (i <= this.timerState.tomatoesFilled) {
                    tomato.classList.add('filled');
                    tomato.setAttribute('data-filled', 'true');
                } else {
                    tomato.classList.remove('filled');
                    tomato.setAttribute('data-filled', 'false');
                }
            }
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update mode indicator
        const modeText = {
            'focus': 'Focus',
            'shortBreak': 'Short Break',
            'longBreak': 'Long Break'
        };
        const modeIndicator = this.windowElement.querySelector('#mode-indicator');
        if (modeIndicator) {
            modeIndicator.textContent = modeText[this.timerState.currentMode];
        }
        
        // Update buttons
        const startBtn = this.windowElement.querySelector('#start-btn');
        const pauseBtn = this.windowElement.querySelector('#pause-btn');
        const skipBtn = this.windowElement.querySelector('#skip-btn');
        
        if (startBtn && pauseBtn && skipBtn) {
            if (this.timerState.isRunning) {
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-block';
                skipBtn.style.display = 'inline-block';
            } else {
                startBtn.style.display = 'inline-block';
                pauseBtn.style.display = 'none';
                skipBtn.style.display = 'none';
            }
        }
        
        this.updateStartButton();
        this.updateTimerDisplay();
    }

    /**
     * Update start button state
     */
    updateStartButton() {
        const startBtn = this.windowElement.querySelector('#start-btn');
        if (startBtn) {
            if (this.timerState.currentMode === 'focus' && !this.selectedTaskId) {
                startBtn.disabled = true;
            } else {
                startBtn.disabled = false;
            }
        }
    }

    /**
     * Play notification sound
     */
    playNotification() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Session ended!');
        }
    }
}
