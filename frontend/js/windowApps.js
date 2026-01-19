/**
 * Window Apps - App content templates and initialization
 * Provides HTML content for each app and initializes their JavaScript
 */

import { Auth } from './auth.js';
import { Todo } from './todo.js';
import { Pomodoro } from './pomodoro.js';
import { Dashboard } from './dashboard.js';
import { CONFIG } from './config.js';

export class WindowApps {
    /**
     * Get app content HTML
     * @param {string} appType - Type of app
     * @returns {string} HTML content for the app
     */
    static getAppContent(appType) {
        switch(appType) {
            case 'pomodoro':
                return this.getPomodoroContent();
            case 'todo':
                return this.getTodoContent();
            case 'dashboard':
                return this.getDashboardContent();
            case 'auth':
                return this.getAuthContent();
            default:
                return '<div class="mac-content"><p>Unknown app</p></div>';
        }
    }

    /**
     * Get Pomodoro app content
     */
    static getPomodoroContent() {
        return `
            <div class="mac-content">
                <!-- Navigation -->
                <nav class="page-nav">
                    <a href="#" class="nav-link" data-open-app="todo">Tasks</a>
                    <span class="nav-separator">|</span>
                    <a href="#" class="nav-link" data-open-app="dashboard">Dashboard</a>
                </nav>

                <!-- Task Selection -->
                <section class="task-selection-section">
                    <label for="task-select" class="task-select-label">Select Task:</label>
                    <div class="task-select-container">
                        <select id="task-select" class="mac-select">
                            <option value="">-- No task selected --</option>
                        </select>
                        <button id="add-task-btn" class="mac-button">Add Task</button>
                    </div>
                </section>

                <!-- Pomodoro Timer Section -->
                <section class="timer-section">
                    <!-- Mode Indicator -->
                    <div class="mode-indicator" id="mode-indicator">Focus</div>
                    
                    <!-- Timer Display -->
                    <div id="timer" class="timer-display">25:00</div>
                    
                    <!-- 4 Tomato Progress Blocks -->
                    <div class="tomato-progress">
                        <div class="tomato-block" id="tomato-1" data-filled="false">
                            <div class="tomato-icon">🍅</div>
                        </div>
                        <div class="tomato-block" id="tomato-2" data-filled="false">
                            <div class="tomato-icon">🍅</div>
                        </div>
                        <div class="tomato-block" id="tomato-3" data-filled="false">
                            <div class="tomato-icon">🍅</div>
                        </div>
                        <div class="tomato-block" id="tomato-4" data-filled="false">
                            <div class="tomato-icon">🍅</div>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="progress-container">
                        <div id="progress-bar" class="progress-bar"></div>
                    </div>
                    
                    <!-- Controls -->
                    <div class="controls">
                        <button id="start-btn" class="mac-button" disabled>Start</button>
                        <button id="pause-btn" class="mac-button" style="display:none;">Pause</button>
                        <button id="reset-btn" class="mac-button">Reset</button>
                        <button id="skip-btn" class="mac-button" style="display:none;">Skip</button>
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * Get Todo app content
     */
    static getTodoContent() {
        return `
            <div class="mac-content">
                <!-- Navigation -->
                <nav class="page-nav">
                    <a href="#" class="nav-link" data-open-app="pomodoro">Pomodoro Timer</a>
                </nav>

                <!-- Task Input Section -->
                <section class="task-section">
                    <h2 class="section-title">Tasks</h2>
                    <div class="task-input-container">
                        <input type="text" id="task-input" class="mac-input" placeholder="Add a new task...">
                        <button type="button" id="add-task-btn" class="mac-button">Add Task</button>
                    </div>
                    
                    <!-- Task List -->
                    <ul id="task-list" class="task-list">
                        <!-- Tasks will be dynamically added here -->
                    </ul>
                    
                    <!-- Empty State -->
                    <div id="empty-state" class="empty-state" style="display:none;">
                        <p>No tasks yet. Add your first task above!</p>
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * Get Dashboard app content
     */
    static getDashboardContent() {
        return `
            <div class="mac-content">
                <!-- Navigation -->
                <nav class="page-nav">
                    <a href="#" class="nav-link" data-open-app="pomodoro">Pomodoro Timer</a>
                    <span class="nav-separator">|</span>
                    <a href="#" class="nav-link" data-open-app="todo">Tasks</a>
                </nav>

                <!-- Statistics Section -->
                <section class="dashboard-section">
                    <h2 class="section-title">Statistics</h2>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="total-pomodoros">0</div>
                            <div class="stat-label">Total Pomodoros</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="total-focus-time">0 min</div>
                            <div class="stat-label">Total Focus Time</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="total-break-time">0 min</div>
                            <div class="stat-label">Total Break Time</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="tasks-completed">0</div>
                            <div class="stat-label">Tasks Completed</div>
                        </div>
                    </div>
                </section>

                <!-- Session History Section -->
                <section class="history-section">
                    <h2 class="section-title">Session History</h2>
                    <div id="session-history" class="session-history">
                        <!-- History items will be dynamically added here -->
                    </div>
                    <div id="empty-history" class="empty-state">
                        <p>No sessions yet. Start a Pomodoro timer to see your progress!</p>
                    </div>
                </section>

                <!-- Daily Summary Section -->
                <section class="daily-summary-section">
                    <h2 class="section-title">Daily Summary</h2>
                    <div id="daily-summary" class="daily-summary">
                        <!-- Daily summaries will be dynamically added here -->
                    </div>
                    <div id="empty-daily" class="empty-state">
                        <p>No daily data yet.</p>
                    </div>
                </section>

                <!-- Reset Button -->
                <div class="dashboard-actions">
                    <button id="reset-stats-btn" class="mac-button mac-button-danger">Reset Statistics</button>
                </div>
            </div>
        `;
    }

    /**
     * Get Auth app content
     */
    static getAuthContent() {
        return `
            <div class="mac-content">
                <!-- Tab Strip -->
                <div class="mac-tabstrip">
                    <button class="mac-tab active" id="tab-signin" data-mode="signin">Sign In</button>
                    <button class="mac-tab" id="tab-signup" data-mode="signup">Sign Up</button>
                </div>
                
                <!-- Form Area -->
                <div class="auth-forms">
                    <!-- Sign In Form -->
                    <form class="auth-form active" id="signin-form" data-mode="signin">
                        <div class="form-group">
                            <label class="form-label">Username or Email</label>
                            <input type="text" id="signin-username" class="mac-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="signin-password" class="mac-input" required>
                        </div>
                        <button type="submit" class="mac-button mac-button-primary">Sign In</button>
                        <div id="signin-error" class="error-message"></div>
                    </form>
                    
                    <!-- Sign Up Form -->
                    <form class="auth-form" id="signup-form" data-mode="signup">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input type="text" id="signup-username" class="mac-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="signup-email" class="mac-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="signup-password" class="mac-input" required minlength="6">
                        </div>
                        <button type="submit" class="mac-button mac-button-primary">Sign Up</button>
                        <div id="signup-error" class="error-message"></div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Initialize app JavaScript when content is loaded
     * @param {HTMLElement} windowElement - The window element
     * @param {string} appType - Type of app to initialize
     */
    static async initApp(windowElement, appType) {
        // Wait for DOM to be ready - give more time for elements to be available
        await new Promise(resolve => setTimeout(resolve, 150));

        console.log(`Initializing ${appType} app...`);
        try {
            switch(appType) {
                case 'pomodoro':
                    console.log('Creating Pomodoro instance...');
                    const pomodoro = new Pomodoro(windowElement);
                    await pomodoro.init();
                    console.log('Pomodoro app initialized');
                    break;
                case 'todo':
                    console.log('Initializing Todo app...');
                    await Todo.init(windowElement);
                    console.log('Todo app initialized');
                    break;
                case 'dashboard':
                    console.log('Initializing Dashboard app...');
                    await Dashboard.init(windowElement);
                    console.log('Dashboard app initialized');
                    break;
                case 'auth':
                    console.log('Initializing Auth app...');
                    Auth.init(windowElement);
                    console.log('Auth app initialized');
                    break;
                default:
                    console.warn('Unknown app type:', appType);
            }
        } catch (error) {
            console.error(`Error initializing ${appType} app:`, error);
            console.error('Error stack:', error.stack);
        }
    }
}

