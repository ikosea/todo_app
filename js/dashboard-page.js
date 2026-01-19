/**
 * Dashboard Page - Analytics and summary only
 * Read-only view of productivity statistics
 */

/**
 * Initialize the page
 */
function init() {
    loadAndDisplayStats();
    loadAndDisplayHistory();
    loadAndDisplayDailySummary();
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Reset statistics button
    document.getElementById('reset-stats-btn').addEventListener('click', resetStatistics);
}

/**
 * Load and display statistics
 */
function loadAndDisplayStats() {
    const history = getSessionHistory();
    const tasks = getTasks();
    
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
    document.getElementById('total-pomodoros').textContent = totalPomodoros;
    document.getElementById('total-focus-time').textContent = formatTime(totalFocusTime);
    document.getElementById('total-break-time').textContent = formatTime(totalBreakTime);
    document.getElementById('tasks-completed').textContent = tasksCompleted;
}

/**
 * Load and display session history
 */
function loadAndDisplayHistory() {
    const history = getSessionHistory();
    const historyContainer = document.getElementById('session-history');
    const emptyHistory = document.getElementById('empty-history');
    
    // Sort by date (newest first)
    const sortedHistory = [...history].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    if (sortedHistory.length === 0) {
        historyContainer.style.display = 'none';
        emptyHistory.style.display = 'block';
        return;
    }
    
    historyContainer.style.display = 'block';
    emptyHistory.style.display = 'none';
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
                <span>⏱️ ${formatTime(entry.focusTime || 0)} Focus</span>
                <span>☕ ${formatTime(entry.breakTime || 0)} Break</span>
            </div>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

/**
 * Load and display daily summary
 */
function loadAndDisplayDailySummary() {
    const history = getSessionHistory();
    const summaryContainer = document.getElementById('daily-summary');
    const emptyDaily = document.getElementById('empty-daily');
    
    if (history.length === 0) {
        summaryContainer.style.display = 'none';
        emptyDaily.style.display = 'block';
        return;
    }
    
    summaryContainer.style.display = 'block';
    emptyDaily.style.display = 'none';
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
function resetStatistics() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        // Clear session history
        localStorage.removeItem('sessionHistory');
        
        // Clear pomodoro state
        localStorage.removeItem('pomodoroState');
        
        // Reload the page to show empty state
        location.reload();
    }
}

/**
 * Get session history from localStorage
 */
function getSessionHistory() {
    const saved = localStorage.getItem('sessionHistory');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Get tasks from localStorage
 */
function getTasks() {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Format time in minutes to readable string
 */
function formatTime(minutes) {
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

