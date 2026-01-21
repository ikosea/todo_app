/**
 * Window Apps - App content templates and initialization
 * Provides HTML content for each app and initializes their JavaScript
 */

import { Auth } from './auth.js';
import { Todo } from './todo.js';
import { Pomodoro } from './pomodoro.js';
import { Dashboard } from './dashboard.js';
import { Trash } from './trash.js';
import { Ambient } from './ambient.js?v=10';
import { Meditation } from './meditation.js?v=10';
import { Folder } from './folder.js';
import { Tutorial } from './tutorial.js?v=10';
import { About } from './about.js?v=10';
import { Settings } from './settings.js?v=10';
import { CONFIG } from './config.js?v=10';

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
            case 'trash':
                return this.getTrashContent();
            case 'ambient':
                return this.getAmbientContent();
            case 'meditation':
                return this.getMeditationContent();
            case 'folder':
                return this.getFolderContent();
            case 'tutorial':
                return this.getTutorialContent();
            case 'about':
                return this.getAboutContent();
            case 'settings':
                return this.getSettingsContent();
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

                <!-- Contribution Calendar Section -->
                <section class="contribution-section">
                    <div class="contribution-header">
                        <h2 class="section-title">Focus Streaks</h2>
                        <div class="contribution-header-controls">
                            <select id="year-selector" class="mac-select year-selector">
                                <!-- Years will be populated dynamically -->
                            </select>
                            <div class="contribution-count" id="contribution-count">0 contributions</div>
                        </div>
                    </div>
                    <div id="contribution-calendar" class="contribution-calendar">
                        <!-- Calendar will be generated here -->
                    </div>
                    <div class="contribution-legend">
                        <span class="legend-label">Less</span>
                        <div class="legend-squares">
                            <div class="legend-square" data-level="0"></div>
                            <div class="legend-square" data-level="1"></div>
                            <div class="legend-square" data-level="2"></div>
                            <div class="legend-square" data-level="3"></div>
                        </div>
                        <span class="legend-label">More</span>
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
                case 'ambient':
                    console.log('Initializing Ambient app...');
                    Ambient.init(windowElement);
                    console.log('Ambient app initialized');
                    break;
                case 'folder':
                    console.log('Initializing Folder app...');
                    await Folder.init(windowElement);
                    console.log('Folder app initialized');
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
                case 'trash':
                    console.log('Initializing Trash app...');
                    await Trash.init(windowElement);
                    console.log('Trash app initialized');
                    break;
                case 'meditation':
                    console.log('Initializing Meditation app...');
                    await Meditation.init(windowElement);
                    console.log('Meditation app initialized');
                    break;
                case 'tutorial':
                    console.log('Initializing Tutorial app...');
                    Tutorial.init(windowElement);
                    console.log('Tutorial app initialized');
                    break;
                case 'about':
                    console.log('Initializing About app...');
                    About.init(windowElement);
                    console.log('About app initialized');
                    break;
                case 'settings':
                    console.log('Initializing Settings app...');
                    Settings.init(windowElement);
                    console.log('Settings app initialized');
                    break;
                default:
                    console.warn('Unknown app type:', appType);
            }
        } catch (error) {
            console.error(`Error initializing ${appType} app:`, error);
            console.error('Error stack:', error.stack);
        }
    }

    /**
     * Get Ambient Noise app content
     */
    static getAmbientContent() {
        return `
            <div class="mac-content">
                <h2 class="section-title" style="margin-top: 0;">Ambient Noise</h2>

                <div class="form-group" style="margin-bottom: 10px;">
                    <label class="form-label" for="ambient-type">Sound</label>
                    <select id="ambient-type" class="mac-select">
                        <option value="white">White Noise</option>
                        <option value="rain">Rain</option>
                        <option value="waves">Waves</option>
                        <option value="coffee">Coffee Shop</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 10px;">
                    <label class="form-label" for="ambient-volume">Volume</label>
                    <input id="ambient-volume" type="range" min="0" max="100" value="35" />
                </div>

                <div style="display:flex; gap: 10px; align-items:center; margin-top: 10px;">
                    <button id="ambient-play" class="mac-button mac-button-primary">Play</button>
                    <div id="ambient-status" style="font-family: 'Geneva', monospace; font-size: 12px;">Paused</div>
                </div>

                <div style="margin-top: 12px; font-family: 'Geneva', monospace; font-size: 11px; color: #808080;">
                    Procedural audio (no external files). Minimize the window to keep it running while you work.
                </div>
            </div>
        `;
    }

    /**
     * Get Meditation app content
     */
    static getMeditationContent() {
        return `
            <div class="mac-content">
                <h2 class="section-title" style="margin-top: 0;">Meditation & Breathing</h2>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label" for="meditation-type">Breathing Technique</label>
                    <select id="meditation-type" class="mac-select">
                        <option value="box">Box Breathing (4-4-4-4)</option>
                        <option value="4-7-8">4-7-8 Breathing</option>
                        <option value="deep">Deep Breathing (6-6)</option>
                        <option value="equal">Equal Breathing (4-4)</option>
                    </select>
                </div>

                <!-- Breathing Visual -->
                <div style="display: flex; flex-direction: column; align-items: center; margin: 20px 0;">
                    <svg width="120" height="120" viewBox="0 0 120 120" style="margin-bottom: 12px;">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#c0c0c0" stroke-width="4"/>
                        <circle id="breathing-progress" cx="60" cy="60" r="45" fill="none" stroke="#000000" stroke-width="6" 
                                stroke-dasharray="283" stroke-dashoffset="283" transform="rotate(-90 60 60)" 
                                style="transition: stroke-dashoffset 0.3s ease;"/>
                    </svg>
                    <div id="breathing-instruction" style="font-family: 'Geneva', monospace; font-size: 18px; font-weight: bold; margin-bottom: 8px;">Ready</div>
                    <div id="breathing-timer" style="font-family: 'Geneva', monospace; font-size: 32px; font-weight: bold;">0</div>
                    <div id="cycle-count" style="font-family: 'Geneva', monospace; font-size: 12px; color: #808080; margin-top: 8px;">Cycles: 0</div>
                </div>

                <!-- Controls -->
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="meditation-start" class="mac-button mac-button-primary">Start</button>
                    <button id="meditation-pause" class="mac-button" style="display: none;">Pause</button>
                    <button id="meditation-reset" class="mac-button">Reset</button>
                </div>

                <div style="margin-top: 16px; font-family: 'Geneva', monospace; font-size: 11px; color: #808080; text-align: center;">
                    Follow the visual guide and timer. Breathe naturally and relax.
                </div>
            </div>
        `;
    }

    /**
     * Get Folder app content
     */
    static getFolderContent() {
        return `
            <div class="mac-content">
                <h2 class="section-title">Folder</h2>
                <div class="empty-state" style="display:block;">
                    <p>Loading...</p>
                </div>
            </div>
        `;
    }

    /**
     * Get Tutorial app content
     */
    static getTutorialContent() {
        return `
            <div class="mac-content">
                <div style="display:flex; align-items:center; justify-content:space-between; gap: 8px;">
                    <h2 id="tutorial-title" class="section-title" style="margin: 0;">Welcome</h2>
                    <div id="tutorial-step-indicator" style="font-family:'Geneva','Chicago', monospace; font-size: 11px; color:#808080;">Step 1</div>
                </div>

                <div id="tutorial-content" style="margin-top: 12px;">
                    <div class="empty-state" style="display:block;"><p>Loading...</p></div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; gap: 8px; margin-top: 16px;">
                    <div style="display:flex; gap: 8px;">
                        <button id="tutorial-prev" class="mac-button">Prev</button>
                        <button id="tutorial-next" class="mac-button mac-button-primary">Next</button>
                    </div>
                    <div style="display:flex; gap: 8px;">
                        <button id="tutorial-skip" class="mac-button">Skip</button>
                        <button id="tutorial-close" class="mac-button">Close</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get About / Feedback app content
     */
    static getAboutContent() {
        return `
            <div class="mac-content">
                <h2 class="section-title" style="margin-top: 0;">Ikosea</h2>

                <div style="font-family:'Geneva','Chicago', monospace; font-size: 12px; line-height: 1.6;">
                    <p style="margin-bottom: 10px;">
                        Built with care as a retro Macintosh-inspired productivity desktop.
                    </p>
                    <p style="margin-bottom: 12px;">
                        <strong>Feedback welcome</strong> — ideas, bugs, UX suggestions, and feature requests.
                    </p>
                </div>

                <div class="task-selection-section" style="margin: 0; padding: 12px;">
                    <div style="display:flex; justify-content:space-between; gap: 10px; align-items:center; flex-wrap:wrap;">
                        <div>
                            <div style="font-size: 11px; font-weight:bold; margin-bottom: 4px;">Contact</div>
                            <div style="font-size: 12px;">
                                GitHub: <span id="about-github-handle">@ikosea</span>
                            </div>
                        </div>
                        <div style="display:flex; gap: 8px; align-items:center;">
                            <button id="about-copy-github" class="mac-button">Copy GitHub</button>
                            <a class="mac-button" href="https://github.com/ikosea" target="_blank" rel="noreferrer" style="text-decoration:none; display:inline-block;">Open Profile</a>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 12px; display:flex; gap: 10px; flex-wrap:wrap; justify-content:center;">
                    <a class="mac-button mac-button-primary" href="https://github.com/ikosea" target="_blank" rel="noreferrer" style="text-decoration:none; display:inline-block;">GitHub</a>
                    <a class="mac-button" href="https://github.com/ikosea?tab=repositories" target="_blank" rel="noreferrer" style="text-decoration:none; display:inline-block;">Repositories</a>
                </div>

                <div style="margin-top: 12px; font-family:'Geneva', monospace; font-size: 11px; color:#808080; text-align:center;">
                    Tip: You can also export your data from File → Export Data before reporting a bug.
                </div>
            </div>
        `;
    }

    /**
     * Get Display Settings app content
     */
    static getSettingsContent() {
        return `
            <div class="mac-content">
                <h2 class="section-title" style="margin-top: 0;">Display Settings</h2>

                <div style="font-family:'Geneva','Chicago', monospace; font-size: 12px; line-height: 1.6; margin-bottom: 20px;">
                    <p>Adjust the appearance of your desktop wallpaper.</p>
                </div>

                <div class="task-selection-section" style="margin-bottom: 16px; padding: 16px;">
                    <div style="margin-bottom: 16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                            <label for="brightness-slider" style="font-size: 11px; font-weight:bold;">Brightness</label>
                            <span id="brightness-value" style="font-size: 11px; font-weight:bold;">100%</span>
                        </div>
                        <input type="range" id="brightness-slider" min="0" max="200" value="100" 
                               style="width: 100%; height: 8px; cursor: pointer;" />
                    </div>

                    <div style="margin-bottom: 16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                            <label for="contrast-slider" style="font-size: 11px; font-weight:bold;">Contrast</label>
                            <span id="contrast-value" style="font-size: 11px; font-weight:bold;">100%</span>
                        </div>
                        <input type="range" id="contrast-slider" min="0" max="200" value="100" 
                               style="width: 100%; height: 8px; cursor: pointer;" />
                    </div>

                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                            <label for="saturation-slider" style="font-size: 11px; font-weight:bold;">Saturation</label>
                            <span id="saturation-value" style="font-size: 11px; font-weight:bold;">100%</span>
                        </div>
                        <input type="range" id="saturation-slider" min="0" max="200" value="100" 
                               style="width: 100%; height: 8px; cursor: pointer;" />
                    </div>
                </div>

                <div style="display:flex; justify-content:center; margin-top: 16px;">
                    <button id="settings-reset" class="mac-button">Reset to Default</button>
                </div>

                <div style="margin-top: 12px; font-family:'Geneva', monospace; font-size: 11px; color:#808080; text-align:center;">
                    Settings are saved automatically and persist across sessions.
                </div>
            </div>
        `;
    }

    /**
     * Get Trash app content
     */
    static getTrashContent() {
        return `
            <div class="mac-content">
                <h2 class="section-title">Trash</h2>
                
                <!-- Trash List -->
                <ul id="trash-list" class="task-list">
                    <!-- Deleted tasks will be dynamically added here -->
                </ul>
                
                <!-- Empty State -->
                <div id="trash-empty-state" class="empty-state" style="display:none;">
                    <p>Trash is empty.</p>
                </div>
                
                <!-- Actions -->
                <div style="margin-top: 16px; text-align: center;">
                    <button id="empty-trash-btn" class="mac-button">Empty Trash</button>
                </div>
            </div>
        `;
    }
}

