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
        this.loadAndDisplayContributionCalendar(windowElement);
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
            Dashboard.loadAndDisplayContributionCalendar(windowElement);
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

    /**
     * Load and display GitHub-style contribution calendar
     */
    static loadAndDisplayContributionCalendar(windowElement, selectedYear = null) {
        const history = this.getSessionHistory();
        const calendarContainer = windowElement.querySelector('#contribution-calendar');
        const contributionCount = windowElement.querySelector('#contribution-count');
        const yearSelector = windowElement.querySelector('#year-selector');
        
        if (!calendarContainer) return;

        // Get available years from history
        const availableYears = new Set();
        history.forEach(entry => {
            if (entry.date) {
                const entryDate = new Date(entry.date);
                availableYears.add(entryDate.getFullYear());
            }
        });
        
        // Always include current year
        const currentYear = new Date().getFullYear();
        availableYears.add(currentYear);
        
        // Sort years descending
        const sortedYears = Array.from(availableYears).sort((a, b) => b - a);
        
        // Populate year selector
        if (yearSelector) {
            yearSelector.innerHTML = '';
            sortedYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                option.selected = year === (selectedYear || currentYear);
                yearSelector.appendChild(option);
            });
            
            // Add event listener if not already added
            if (!yearSelector.dataset.listenerAdded) {
                yearSelector.addEventListener('change', (e) => {
                    const year = parseInt(e.target.value);
                    this.loadAndDisplayContributionCalendar(windowElement, year);
                });
                yearSelector.dataset.listenerAdded = 'true';
            }
        }

        // Use selected year or current year
        const displayYear = selectedYear || currentYear;
        const startDate = new Date(displayYear, 0, 1); // January 1st
        const endDate = new Date(displayYear, 11, 31); // December 31st
        
        // Create a map of date strings to contribution counts (pomodoros)
        const contributionMap = new Map();
        history.forEach(entry => {
            if (entry.date && entry.pomodoros) {
                const entryDate = new Date(entry.date);
                // Only include entries from selected year
                if (entryDate.getFullYear() === displayYear) {
                    contributionMap.set(entry.date, (contributionMap.get(entry.date) || 0) + entry.pomodoros);
                }
            }
        });

        // Calculate total contributions
        let totalContributions = 0;
        contributionMap.forEach(count => {
            totalContributions += count;
        });

        // Update contribution count
        if (contributionCount) {
            contributionCount.textContent = `${totalContributions} contributions in ${displayYear}`;
        }

        // Generate calendar grid
        const calendar = this.generateContributionCalendar(startDate, endDate, contributionMap);
        calendarContainer.innerHTML = calendar;
    }

    /**
     * Generate GitHub-style contribution calendar HTML
     * GitHub shows weeks as columns, days as rows
     */
    static generateContributionCalendar(startDate, endDate, contributionMap) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const daysOfWeek = ['Mon', 'Wed', 'Fri'];
        
        // Find the first Monday on or before startDate
        const firstMonday = new Date(startDate);
        const dayOfWeek = firstMonday.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
        firstMonday.setDate(firstMonday.getDate() - diff);

        // Create array of all dates from first Monday to end
        const dates = [];
        const currentDate = new Date(firstMonday);
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Group dates into weeks (7 days each)
        const weeks = [];
        for (let i = 0; i < dates.length; i += 7) {
            const week = dates.slice(i, i + 7);
            // Ensure week has 7 days (pad if needed)
            while (week.length < 7) {
                const lastDate = new Date(week[week.length - 1]);
                lastDate.setDate(lastDate.getDate() + 1);
                week.push(lastDate);
            }
            weeks.push(week);
        }

        const numWeeks = weeks.length;

        // Generate HTML
        let html = '<div class="calendar-wrapper">';
        
        // Month labels row - use dynamic grid
        html += `<div class="calendar-months" style="grid-template-columns: 24px repeat(${numWeeks}, 12px);">`;
        html += '<div></div>'; // Empty cell for day labels column
        let lastMonth = -1;
        let lastMonthWeekIdx = -1;
        weeks.forEach((week, weekIdx) => {
            const firstDay = week[0];
            const month = firstDay.getMonth();
            // Only show month label if it's the first week of the month or if we skipped a month
            // Also ensure labels don't overlap by spacing them at least 4 weeks apart
            if (month !== lastMonth && (lastMonthWeekIdx === -1 || weekIdx - lastMonthWeekIdx >= 3)) {
                html += `<div class="calendar-month-label" style="grid-column: ${weekIdx + 2};">${months[month]}</div>`;
                lastMonth = month;
                lastMonthWeekIdx = weekIdx;
            }
        });
        html += '</div>';

        // Calendar grid
        html += '<div class="calendar-grid-container">';
        
        // Day labels column
        html += '<div class="calendar-day-labels">';
        daysOfWeek.forEach((day, idx) => {
            const dayIndex = idx === 0 ? 0 : idx === 1 ? 2 : 4; // Mon=0, Wed=2, Fri=4
            html += `<div class="calendar-day-label" style="grid-row: ${dayIndex + 1};">${day}</div>`;
        });
        html += '</div>';

        // Calendar squares - weeks as columns, days as rows
        html += `<div class="calendar-squares" style="grid-template-columns: repeat(${numWeeks}, 12px);">`;
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            weeks.forEach((week, weekIdx) => {
                const date = week[dayOfWeek];
                // Only show squares for dates within our range
                if (date >= startDate && date <= endDate) {
                    const dateStr = date.toISOString().split('T')[0];
                    const contributionCount = contributionMap.get(dateStr) || 0;
                    const level = this.getContributionLevel(contributionCount);
                    const tooltip = contributionCount > 0 
                        ? `${contributionCount} pomodoro${contributionCount > 1 ? 's' : ''} on ${this.formatCalendarDate(dateStr)}`
                        : `No contributions on ${this.formatCalendarDate(dateStr)}`;
                    
                    html += `<div class="calendar-square" data-level="${level}" data-date="${dateStr}" title="${tooltip}" style="grid-column: ${weekIdx + 1}; grid-row: ${dayOfWeek + 1};"></div>`;
                } else {
                    // Empty square for dates outside range
                    html += `<div class="calendar-square calendar-square-empty" style="grid-column: ${weekIdx + 1}; grid-row: ${dayOfWeek + 1};"></div>`;
                }
            });
        }
        html += '</div>';

        html += '</div></div>';
        return html;
    }

    /**
     * Get contribution level (0-3) based on count
     */
    static getContributionLevel(count) {
        if (count === 0) return 0;
        if (count === 1) return 1;
        if (count >= 2 && count <= 3) return 2;
        return 3; // 4 or more
    }

    /**
     * Format date for calendar tooltip
     */
    static formatCalendarDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }
}
