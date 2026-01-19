/**
 * Pomodoro Timer - Simple standalone version
 * Handles timer logic, task selection, and tomato progress
 */

// Timer state
let timerState = {
    seconds: 25 * 60, // 25 minutes in seconds
    isRunning: false,
    intervalId: null,
    currentMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
    pomodorosCompleted: 0,
    tomatoesFilled: 0
};

// Task state
let selectedTaskId = null;

/**
 * Initialize the page
 */
function init() {
    loadSavedState();
    loadTasks();
    setupEventListeners();
    updateUI();
}

/**
 * Load saved state from localStorage
 */
function loadSavedState() {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
        const state = JSON.parse(saved);
        timerState.seconds = state.seconds || 25 * 60;
        timerState.currentMode = state.currentMode || 'focus';
        timerState.pomodorosCompleted = state.pomodorosCompleted || 0;
        timerState.tomatoesFilled = state.tomatoesFilled || 0;
        selectedTaskId = state.selectedTaskId || null;
        updateTomatoes();
    }
}

/**
 * Save current state to localStorage
 */
function saveState() {
    const state = {
        seconds: timerState.seconds,
        currentMode: timerState.currentMode,
        pomodorosCompleted: timerState.pomodorosCompleted,
        tomatoesFilled: timerState.tomatoesFilled,
        selectedTaskId: selectedTaskId
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
}

/**
 * Load tasks from localStorage and populate dropdown
 */
function loadTasks() {
    const tasks = getTasks();
    const select = document.getElementById('task-select');
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">-- No task selected --</option>';
    
    // Add tasks
    tasks.forEach(task => {
        if (!task.completed) {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.text;
            if (task.id === selectedTaskId) {
                option.selected = true;
            }
            select.appendChild(option);
        }
    });
}

/**
 * Get tasks from localStorage
 */
function getTasks() {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Timer controls
    document.getElementById('start-btn').addEventListener('click', startTimer);
    document.getElementById('pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    document.getElementById('skip-btn').addEventListener('click', skipSession);
    
    // Task selection
    document.getElementById('task-select').addEventListener('change', handleTaskSelect);
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            // Check if we're in desktop mode
            if (document.body.classList.contains('desktop-body')) {
                // Open todo app window
                window.dispatchEvent(new CustomEvent('openApp', { 
                    detail: { appType: 'todo' } 
                }));
            } else {
                // Navigate to todo page
                window.location.href = 'todo.html';
            }
        });
    }
}

/**
 * Handle task selection
 */
function handleTaskSelect(e) {
    selectedTaskId = e.target.value ? parseInt(e.target.value) : null;
    saveState();
    updateStartButton();
}

/**
 * Start the timer
 */
function startTimer() {
    if (!selectedTaskId && timerState.currentMode === 'focus') {
        alert('Please select a task first!');
        return;
    }
    
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    timerState.intervalId = setInterval(() => {
        timerState.seconds--;
        updateTimerDisplay();
        saveState();
        
        if (timerState.seconds <= 0) {
            handleSessionEnd();
        }
    }, 1000);
    
    updateUI();
}

/**
 * Pause the timer
 */
function pauseTimer() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    timerState.isRunning = false;
    updateUI();
    saveState();
}

/**
 * Reset the timer
 */
function resetTimer() {
    pauseTimer();
    
    // Reset to current mode duration
    if (timerState.currentMode === 'focus') {
        timerState.seconds = 25 * 60;
    } else if (timerState.currentMode === 'shortBreak') {
        timerState.seconds = 5 * 60;
    } else {
        timerState.seconds = 15 * 60;
    }
    
    updateTimerDisplay();
    saveState();
}

/**
 * Skip current session
 */
function skipSession() {
    pauseTimer();
    handleSessionEnd();
}

/**
 * Handle session end
 */
function handleSessionEnd() {
    pauseTimer();
    
    // Play notification sound (optional)
    playNotification();
    
    if (timerState.currentMode === 'focus') {
        // Complete a Pomodoro
        timerState.pomodorosCompleted++;
        timerState.tomatoesFilled++;
        
        // Save session to history
        saveSessionToHistory();
        
        // Increment task pomodoro count
        if (selectedTaskId) {
            incrementTaskPomodoroCount(selectedTaskId);
        }
        
        // Check if we need long break (after 4 pomodoros)
        if (timerState.tomatoesFilled >= 4) {
            timerState.currentMode = 'longBreak';
            timerState.seconds = 15 * 60;
            timerState.tomatoesFilled = 0; // Reset tomatoes
        } else {
            timerState.currentMode = 'shortBreak';
            timerState.seconds = 5 * 60;
        }
        
        updateTomatoes();
    } else {
        // Break ended, go back to focus
        timerState.currentMode = 'focus';
        timerState.seconds = 25 * 60;
    }
    
    updateUI();
    saveState();
    updateTimerDisplay();
}

/**
 * Save session to history
 */
function saveSessionToHistory() {
    const history = getSessionHistory();
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
    todayEntry.focusTime += 25; // 25 minutes
    
    // Save back to localStorage
    localStorage.setItem('sessionHistory', JSON.stringify(history));
}

/**
 * Get session history from localStorage
 */
function getSessionHistory() {
    const saved = localStorage.getItem('sessionHistory');
    return saved ? JSON.parse(saved) : [];
}

/**
 * Increment task pomodoro count
 */
function incrementTaskPomodoroCount(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.pomodoroCount = (task.pomodoroCount || 0) + 1;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timerState.seconds / 60);
    const seconds = timerState.seconds % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Update progress bar
    const totalSeconds = getModeDuration(timerState.currentMode) * 60;
    const progress = ((totalSeconds - timerState.seconds) / totalSeconds) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

/**
 * Get duration for mode in minutes
 */
function getModeDuration(mode) {
    if (mode === 'focus') return 25;
    if (mode === 'shortBreak') return 5;
    return 15; // longBreak
}

/**
 * Update tomatoes display
 */
function updateTomatoes() {
    for (let i = 1; i <= 4; i++) {
        const tomato = document.getElementById(`tomato-${i}`);
        if (i <= timerState.tomatoesFilled) {
            tomato.classList.add('filled');
            tomato.setAttribute('data-filled', 'true');
        } else {
            tomato.classList.remove('filled');
            tomato.setAttribute('data-filled', 'false');
        }
    }
}

/**
 * Update UI elements
 */
function updateUI() {
    // Update mode indicator
    const modeText = {
        'focus': 'Focus',
        'shortBreak': 'Short Break',
        'longBreak': 'Long Break'
    };
    document.getElementById('mode-indicator').textContent = modeText[timerState.currentMode];
    
    // Update buttons
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    if (timerState.isRunning) {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        skipBtn.style.display = 'inline-block';
    } else {
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        skipBtn.style.display = 'none';
    }
    
    updateStartButton();
    updateTimerDisplay();
}

/**
 * Update start button state
 */
function updateStartButton() {
    const startBtn = document.getElementById('start-btn');
    if (timerState.currentMode === 'focus' && !selectedTaskId) {
        startBtn.disabled = true;
    } else {
        startBtn.disabled = false;
    }
}

/**
 * Play notification sound (optional)
 */
function playNotification() {
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
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Fallback: just log
        console.log('Session ended!');
    }
}

// Export for module compatibility
export default { init };

// Also make init available globally for desktop integration
if (typeof window !== 'undefined') {
    window.PomodoroSimple = { init };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

