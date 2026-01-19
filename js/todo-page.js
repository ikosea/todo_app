/**
 * Todo & Dashboard Page - Handles task management and statistics
 */

import { Tasks } from './tasks.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';
import { AuthCheck } from './auth-check.js';
import { Timer } from './timer.js';
import { API } from './api.js';

class TodoPage {
    constructor() {
        this.sessionHistory = Storage.loadHistory();
    }

    /**
     * Initialize the Todo page
     */
    async init() {
        // Check authentication
        const isAuth = await AuthCheck.requireAuth();
        if (!isAuth) return;

        // Initialize UI
        UI.init();

        // Initialize Tasks from backend API
        const savedTasks = await Storage.loadTasks();
        const selectedTaskId = Storage.loadSelectedTaskId();
        Tasks.init(savedTasks, selectedTaskId);
        Tasks.onTaskSelect = (task) => {
            // Update dropdown and displays
            this.updateTaskDropdown();
            this.updateCurrentTaskDisplay();
            this.updateTimerActiveTask();
        };
        Tasks.onTaskChange = (tasks) => {
            Storage.saveTasks(tasks);
            this.updateTaskDropdown();
            this.updateCurrentTaskDisplay();
        };

        // Initialize Timer
        Timer.init();
        this.initTimerWidget();

        // Initial UI updates
        this.updateTaskDropdown();
        this.updateCurrentTaskDisplay();
        this.updateTimerActiveTask();
        this.setupMenuBar();

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Setup menu bar interactions
     */
    setupMenuBar() {
        const userMenu = document.getElementById('user-menu');
        const dropdown = document.getElementById('user-dropdown');
        const logoutItem = document.getElementById('logout-item');
        const menuUsername = document.getElementById('menu-username');

        // Update menu username
        const currentUser = AuthCheck.getCurrentUser();
        if (currentUser && menuUsername) {
            menuUsername.textContent = currentUser.username;
        }

        // Toggle dropdown
        if (userMenu) {
            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (userMenu) userMenu.classList.remove('active');
        });

        // Logout
        if (logoutItem) {
            logoutItem.addEventListener('click', (e) => {
                e.stopPropagation();
                API.logout();
            });
        }
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Task management
        const addBtn = document.getElementById("add-task");
        const taskInput = document.getElementById("task-input");
        
        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addTask();
            });
        } else {
            console.error("Add task button not found");
        }

        if (taskInput) {
            taskInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.addTask();
                }
            });
        } else {
            console.error("Task input not found");
        }

        // Task selector dropdown
        const taskSelectorBtn = document.getElementById('task-selector-btn');
        const taskDropdown = document.getElementById('task-dropdown');
        
        if (taskSelectorBtn && taskDropdown) {
            taskSelectorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = taskDropdown.style.display !== 'none';
                taskDropdown.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) {
                    this.updateTaskDropdown();
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!taskSelectorBtn.contains(e.target) && !taskDropdown.contains(e.target)) {
                    taskDropdown.style.display = 'none';
                }
            });
        }

        // Timer controls
        const timerStartBtn = document.getElementById('timer-start-btn');
        const timerPauseBtn = document.getElementById('timer-pause-btn');
        const timerResetBtn = document.getElementById('timer-reset-btn');

        if (timerStartBtn) {
            timerStartBtn.addEventListener('click', () => {
                if (!Tasks.hasSelection()) {
                    alert('Please select a task before starting the timer');
                    return;
                }
                Timer.start();
            });
        }

        if (timerPauseBtn) {
            timerPauseBtn.addEventListener('click', () => {
                Timer.pause();
            });
        }

        if (timerResetBtn) {
            timerResetBtn.addEventListener('click', () => {
                Timer.reset();
            });
        }
    }

    /**
     * Add a new task
     */
    async addTask() {
        const taskInput = document.getElementById("task-input");
        const text = taskInput ? taskInput.value.trim() : "";
        
        if (!text) {
            return;
        }
        
        const task = await Tasks.add(text);
        
        if (task) {
            if (taskInput) {
                taskInput.value = "";
            }
            // Auto-select the new task if none selected
            if (!Tasks.hasSelection()) {
                Tasks.select(task.id);
            }
            this.updateTaskDropdown();
            this.updateCurrentTaskDisplay();
            this.updateTimerActiveTask();
        }
    }

    /**
     * Update user greeting
     */
    updateUserGreeting() {
        const greetingEl = document.getElementById('user-greeting');
        if (!greetingEl) return;
        
        const currentUser = localStorage.getItem(CONFIG.STORAGE.CURRENT_USER);
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                greetingEl.textContent = `Welcome, ${user.username}`;
            } catch (e) {
                greetingEl.textContent = 'Welcome';
            }
        } else {
            greetingEl.textContent = 'Welcome';
        }
    }

    /**
     * Initialize timer widget in dashboard
     */
    initTimerWidget() {
        // Set up timer callbacks
        Timer.onTick = (seconds) => {
            const displayEl = document.getElementById('timer-display');
            if (displayEl) {
                displayEl.textContent = Timer.getFormattedTime();
            }
            
            const progressBar = document.getElementById('timer-progress-bar');
            if (progressBar) {
                progressBar.style.width = Timer.getProgress() + '%';
            }
        };

        Timer.onStateChange = (state) => {
            const startBtn = document.getElementById('timer-start-btn');
            const pauseBtn = document.getElementById('timer-pause-btn');
            const sessionLabel = document.getElementById('timer-session-label');
            
            if (startBtn && pauseBtn) {
                if (state.isRunning) {
                    startBtn.style.display = 'none';
                    pauseBtn.style.display = 'inline-block';
                } else {
                    startBtn.style.display = 'inline-block';
                    pauseBtn.style.display = 'none';
                }
            }
            
            if (sessionLabel) {
                sessionLabel.textContent = Timer.getSessionLabel();
            }
        };

        Timer.onSessionEnd = async () => {
            // Increment pomodoro count for selected task
            if (Timer.currentSession === "work") {
                await Tasks.incrementPomodoro();
                // Update displays after pomodoro increment
                this.updateTaskDropdown();
                this.updateCurrentTaskDisplay();
                this.updateTimerActiveTask();
            }
            
            // Record session
            if (Timer.currentSession === "work") {
                this.recordSession();
            }
        };

        // Initial display
        const displayEl = document.getElementById('timer-display');
        if (displayEl) {
            displayEl.textContent = Timer.getFormattedTime();
        }
        
        const sessionLabel = document.getElementById('timer-session-label');
        if (sessionLabel) {
            sessionLabel.textContent = Timer.getSessionLabel();
        }
        
        const progressBar = document.getElementById('timer-progress-bar');
        if (progressBar) {
            progressBar.style.width = Timer.getProgress() + '%';
        }

        // Update active task display
        this.updateTimerActiveTask();
    }

    /**
     * Update task dropdown
     */
    updateTaskDropdown() {
        const dropdownList = document.getElementById('task-dropdown-list');
        const dropdownEmpty = document.getElementById('task-dropdown-empty');
        const taskSelectorText = document.getElementById('task-selector-text');
        
        if (!dropdownList || !dropdownEmpty) return;

        const tasks = Tasks.getAll();
        
        // Update dropdown button text
        if (taskSelectorText) {
            const selectedTask = Tasks.getSelectedTask();
            if (selectedTask) {
                taskSelectorText.textContent = selectedTask.text;
            } else {
                taskSelectorText.textContent = 'Select Task';
            }
        }

        // Clear dropdown
        dropdownList.innerHTML = '';
        
        if (tasks.length === 0) {
            dropdownEmpty.style.display = 'block';
            return;
        }

        dropdownEmpty.style.display = 'none';
        
        // Populate dropdown with tasks
        tasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'task-dropdown-item';
            if (task.id === Tasks.selectedTaskId) {
                item.classList.add('selected');
            }
            item.setAttribute('data-task-id', task.id);
            item.textContent = task.text + (task.pomodoroCount > 0 ? ` (${task.pomodoroCount})` : '');
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(item.getAttribute('data-task-id'));
                Tasks.select(taskId);
                this.updateTaskDropdown();
                this.updateCurrentTaskDisplay();
                this.updateTimerActiveTask();
                const dropdown = document.getElementById('task-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
            });
            
            dropdownList.appendChild(item);
        });
    }

    /**
     * Update current task display
     */
    updateCurrentTaskDisplay() {
        const currentTaskContent = document.getElementById('current-task-content');
        if (!currentTaskContent) return;

        const selectedTask = Tasks.getSelectedTask();
        if (selectedTask) {
            currentTaskContent.textContent = selectedTask.text;
            currentTaskContent.classList.add('has-task');
        } else {
            currentTaskContent.textContent = 'No task selected';
            currentTaskContent.classList.remove('has-task');
        }
    }

    /**
     * Update active task display in timer widget
     */
    updateTimerActiveTask() {
        const selectedTaskName = document.getElementById('selected-task-name');
        const selectedTaskPomodoros = document.getElementById('selected-task-pomodoros');
        
        const selectedTask = Tasks.getSelectedTask();
        if (selectedTask) {
            if (selectedTaskName) {
                selectedTaskName.textContent = selectedTask.text;
            }
            if (selectedTaskPomodoros) {
                const count = selectedTask.pomodoroCount || 0;
                selectedTaskPomodoros.textContent = `${count} pomodoro${count !== 1 ? 's' : ''}`;
            }
        } else {
            if (selectedTaskName) {
                selectedTaskName.textContent = 'No task selected';
            }
            if (selectedTaskPomodoros) {
                selectedTaskPomodoros.textContent = '0 pomodoros';
            }
        }
    }

    /**
     * Record completed session
     */
    recordSession() {
        const today = getTodayDateString();
        this.sessionHistory.push({
            date: today,
            type: "work",
            duration: Timer.WORK_DURATION
        });
        Storage.saveHistory(this.sessionHistory);
        // Note: Stats are updated in Dashboard app, not here
    }

    /**
     * Update dashboard statistics (only if elements exist - for combined page)
     */
    updateStats() {
        const todayEl = document.getElementById("today-count");
        const weekEl = document.getElementById("week-count");
        const minutesEl = document.getElementById("focus-minutes");

        // Stats elements might not exist on Pomodoro & Tasks page
        if (!todayEl || !weekEl || !minutesEl) return;

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        let todayCount = 0;
        let weekCount = 0;
        let minutes = 0;

        this.sessionHistory.forEach(s => {
            const sessionDate = new Date(s.date);

            if (s.date === todayStr) todayCount++;
            if (sessionDate >= weekStart) weekCount++;

            minutes += s.duration;
        });

        todayEl.textContent = todayCount;
        weekEl.textContent = weekCount;
        minutesEl.textContent = minutes;
    }
}

// Export for use in windows
export default TodoPage;

// Initialize page when DOM is ready (only if not in a window)
if (document.body && !document.body.classList.contains('desktop-body')) {
    document.addEventListener("DOMContentLoaded", () => {
        const page = new TodoPage();
        page.init();
    });
}

