/**
 * Dashboard Module - Analytics and summary
 * Read-only view of productivity statistics
 */

import { API } from './api.js';
import { CONFIG } from './config.js';

export class Dashboard {
    /**
     * Initialize Dashboard app
     * @param {HTMLElement} windowElement - The window element
     */
    static async init(windowElement) {
        await this.loadAndDisplayStats(windowElement);
        this.loadAndDisplayHistory(windowElement);
        this.loadAndDisplayDailySummary(windowElement);
        this.setupEventListeners(windowElement);
        this.setupNavigationLinks(windowElement);
        // Listen for task updates from other windows
        window.addEventListener('tasksUpdated', () => {
            Dashboard.loadAndDisplayStats(windowElement);
        });
        // Listen for session updates (when pomodoro completes)
        window.addEventListener('sessionUpdated', () => {
            Dashboard.loadAndDisplayStats(windowElement);
            Dashboard.loadAndDisplayHistory(windowElement);
            Dashboard.loadAndDisplayDailySummary(windowElement);
        });
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners(windowElement) {
        const resetBtn = windowElement.querySelector('#reset-stats-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetStatistics(windowElement));
        }
    }

    /**
     * Setup navigation links
     */
    static setupNavigationLinks(windowElement) {
        const navLinks = windowElement.querySelectorAll('[data-open-app]');
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
     * Load and display statistics
     */
    static async loadAndDisplayStats(windowElement) {
        const history = this.getSessionHistory();
        let tasks = [];
        
        try {
            tasks = await API.getTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
        
        // Calculate totals
        let totalPomodoros = 0;
        let totalFocusTime = 0;
        let totalBreakTime = 0;
        let tasksCompleted = 0;
        
        // Calculate from history
        history.forEach(entry => {
            totalPomodoros += entry.pomodoros || 0;
            totalFocusTime += entry.focusTime || 0;
            totalBreakTime += entry.breakTime || 0;
        });
        
        // Count completed tasks
        tasksCompleted = tasks.filter(t => t.completed).length;
        
        // Update UI
        const totalPomodorosEl = windowElement.querySelector('#total-pomodoros');
        const totalFocusTimeEl = windowElement.querySelector('#total-focus-time');
        const totalBreakTimeEl = windowElement.querySelector('#total-break-time');
        const tasksCompletedEl = windowElement.querySelector('#tasks-completed');
        
        if (totalPomodorosEl) totalPomodorosEl.textContent = totalPomodoros;
        if (totalFocusTimeEl) totalFocusTimeEl.textContent = this.formatTime(totalFocusTime);
        if (totalBreakTimeEl) totalBreakTimeEl.textContent = this.formatTime(totalBreakTime);
        if (tasksCompletedEl) tasksCompletedEl.textContent = tasksCompleted;
    }

    /**
     * Load and display session history
     */
    static loadAndDisplayHistory(windowElement) {
        const history = this.getSessionHistory();
        const historyContainer = windowElement.querySelector('#session-history');
        const emptyHistory = windowElement.querySelector('#empty-history');
        
        if (!historyContainer) return;
        
        // Sort by date (newest first)
        const sortedHistory = [...history].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        if (sortedHistory.length === 0) {
            if (historyContainer) historyContainer.style.display = 'none';
            if (emptyHistory) emptyHistory.style.display = 'block';
            return;
        }
        
        if (historyContainer) historyContainer.style.display = 'block';
        if (emptyHistory) emptyHistory.style.display = 'none';
        historyContainer.innerHTML = '';
        
        // Display last 10 entries
        sortedHistory.slice(0, 10).forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            historyItem.innerHTML = `
                <div class="history-date">${dateStr}</div>
                <div class="history-stats">
                    <span>🍅 ${entry.pomodoros || 0} Pomodoros</span>
                    <span>⏱️ ${this.formatTime(entry.focusTime || 0)} Focus</span>
                    <span>☕ ${this.formatTime(entry.breakTime || 0)} Break</span>
                </div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    }

    /**
     * Load and display daily summary
     */
    static loadAndDisplayDailySummary(windowElement) {
        const history = this.getSessionHistory();
        const summaryContainer = windowElement.querySelector('#daily-summary');
        const emptyDaily = windowElement.querySelector('#empty-daily');
        
        if (!summaryContainer) return;
        
        if (history.length === 0) {
            summaryContainer.style.display = 'none';
            if (emptyDaily) emptyDaily.style.display = 'block';
            return;
        }
        
        summaryContainer.style.display = 'block';
        if (emptyDaily) emptyDaily.style.display = 'none';
        summaryContainer.innerHTML = '';
        
        // Group by date and show last 7 days
        const today = new Date();
        const last7Days = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const entry = history.find(h => h.date === dateStr);
            last7Days.push({
                date: dateStr,
                dateObj: date,
                pomodoros: entry ? (entry.pomodoros || 0) : 0
            });
        }
        
        last7Days.forEach(day => {
            const dayItem = document.createElement('div');
            dayItem.className = 'daily-item';
            
            const dateStr = day.dateObj.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            dayItem.innerHTML = `
                <div class="daily-date">${dateStr}</div>
                <div class="daily-pomodoros">🍅 ${day.pomodoros}</div>
            `;
            
            summaryContainer.appendChild(dayItem);
        });
    }

    /**
     * Reset statistics with confirmation
     */
    static resetStatistics(windowElement) {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            // Clear session history
            localStorage.removeItem('sessionHistory');
            
            // Clear pomodoro state
            localStorage.removeItem('pomodoroState');
            
            // Reload dashboard
            this.init(windowElement);
        }
    }

    /**
     * Get session history from localStorage
     */
    static getSessionHistory() {
        const saved = localStorage.getItem('sessionHistory');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Format time in minutes to readable string
     */
    static formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours} hr`;
        }
        return `${hours} hr ${mins} min`;
    }
}
