/**
 * Window Apps - App content templates and initialization
 * Phase 5: App Integration
 */

export class WindowApps {
    /**
     * Get app content HTML
     */
    static getAppContent(appType) {
        switch(appType) {
            case 'productivity':
                return this.getProductivityMenu();
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
     * Get productivity menu (choose Todo or Pomodoro)
     */
    static getProductivityMenu() {
        return `
            <div class="mac-content">
                <div style="text-align: center; padding: 40px;">
                    <h2 class="section-title">Productivity Apps</h2>
                    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                        <button class="mac-button" data-open-app="todo" style="padding: 20px 40px;">
                            <div style="font-size: 24px; margin-bottom: 10px;">✓</div>
                            <div>Todo & Dashboard</div>
                        </button>
                        <button class="mac-button" data-open-app="pomodoro" style="padding: 20px 40px;">
                            <div style="font-size: 24px; margin-bottom: 10px;">⏱️</div>
                            <div>Pomodoro Timer</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get Todo app content (Task Management)
     */
    static getTodoContent() {
        return `
            <nav class="mac-menubar">
                <div class="mac-menu-item mac-menu-dropdown">
                    <span>File</span>
                    <div class="mac-dropdown">
                        <div class="mac-dropdown-item" data-action="show-desktop">Show Desktop</div>
                        <div class="mac-dropdown-item" data-action="close-window">Close Window</div>
                    </div>
                </div>
                <div class="mac-menu-item">
                    <span>Help</span>
                </div>
            </nav>
            <div class="mac-content">
                <!-- Navigation -->
                <nav class="page-nav">
                    <a href="#" class="nav-link" data-open-app="pomodoro">Pomodoro Timer</a>
                    <span class="nav-separator">|</span>
                    <a href="#" class="nav-link" data-open-app="dashboard">Dashboard</a>
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
     * Get Pomodoro app content
     */
    static getPomodoroContent() {
        return `
            <nav class="mac-menubar">
                <div class="mac-menu-item mac-menu-dropdown">
                    <span>File</span>
                    <div class="mac-dropdown">
                        <div class="mac-dropdown-item" data-action="show-desktop">Show Desktop</div>
                        <div class="mac-dropdown-item" data-action="close-window">Close Window</div>
                    </div>
                </div>
                <div class="mac-menu-item">
                    <span>Help</span>
                </div>
            </nav>
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
     * Get Dashboard app content
     */
    static getDashboardContent() {
        return `
            <nav class="mac-menubar">
                <div class="mac-menu-item mac-menu-dropdown">
                    <span>File</span>
                    <div class="mac-dropdown">
                        <div class="mac-dropdown-item" data-action="show-desktop">Show Desktop</div>
                        <div class="mac-dropdown-item" data-action="close-window">Close Window</div>
                    </div>
                </div>
                <div class="mac-menu-item">
                    <span>Help</span>
                </div>
            </nav>
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
            <nav class="mac-menubar">
                <div class="mac-menu-item mac-menu-dropdown">
                    <span>File</span>
                    <div class="mac-dropdown">
                        <div class="mac-dropdown-item" data-action="show-desktop">Show Desktop</div>
                        <div class="mac-dropdown-item" data-action="close-window">Close Window</div>
                    </div>
                </div>
                <div class="mac-menu-item mac-menu-dropdown" id="auth-menu">
                    <span>Auth</span>
                    <div class="mac-dropdown" id="auth-dropdown">
                        <div class="mac-dropdown-item" data-mode="signin">Sign In</div>
                        <div class="mac-dropdown-item" data-mode="signup">Sign Up</div>
                    </div>
                </div>
                <div class="mac-menu-item">
                    <span>Help</span>
                </div>
                <div class="mac-menu-item">
                    <span>About</span>
                </div>
            </nav>
            <div class="mac-content">
                <!-- Tab Strip -->
                <div class="mac-tabstrip">
                    <button class="mac-tab" id="tab-signin" data-mode="signin">Sign In</button>
                    <button class="mac-tab" id="tab-signup" data-mode="signup">Sign Up</button>
                </div>
                
                <!-- Form Area -->
                <div class="auth-forms">
                    <!-- Sign In Form -->
                    <form class="auth-form" id="signin-form" data-mode="signin">
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
     */
    static async initApp(windowElement, appType) {
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Setup window menu actions (Show Desktop, Close Window)
        this.setupWindowMenuActions(windowElement);

        switch(appType) {
            case 'todo':
                return this.initTodoApp(windowElement);
            case 'pomodoro':
                return this.initPomodoroApp(windowElement);
            case 'dashboard':
                return this.initDashboardApp(windowElement);
            case 'auth':
                return this.initAuthApp(windowElement);
            case 'productivity':
                return this.initProductivityMenu(windowElement);
            default:
                return;
        }
    }

    /**
     * Setup window menu actions (Show Desktop, Close Window)
     */
    static setupWindowMenuActions(windowElement) {
        const menuItems = windowElement.querySelectorAll('[data-action]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.getAttribute('data-action');
                
                if (action === 'show-desktop') {
                    // Dispatch event to show desktop
                    window.dispatchEvent(new CustomEvent('showDesktop'));
                } else if (action === 'close-window') {
                    // Find window ID and close it
                    const windowId = windowElement.id;
                    window.dispatchEvent(new CustomEvent('closeWindow', { detail: { windowId } }));
                }
                
                // Close dropdown
                const dropdown = item.closest('.mac-menu-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('active');
                }
            });
        });
    }

    /**
     * Initialize Pomodoro app (using new Pomodoro class)
     */
    static async initPomodoroApp(windowElement) {
        try {
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Import and initialize new Pomodoro class
            const { Pomodoro } = await import('../frontend/js/pomodoro.js');
            const pomodoro = new Pomodoro(windowElement);
            await pomodoro.init();
            
            // Setup navigation links to open windows
            this.setupNavigationLinks(windowElement);
        } catch (error) {
            console.error('Error initializing Pomodoro app:', error);
        }
    }

    /**
     * Initialize Todo app (simple version)
     */
    static async initTodoApp(windowElement) {
        try {
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Import and initialize simple Todo
            const todoModule = await import('./todo-page-simple.js');
            // The module auto-initializes on load
            
            // Setup navigation links to open windows
            this.setupNavigationLinks(windowElement);
        } catch (error) {
            console.error('Error initializing Todo app:', error);
        }
    }

    /**
     * Initialize Dashboard app
     */
    static async initDashboardApp(windowElement) {
        try {
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Import and initialize Dashboard
            const dashboardModule = await import('./dashboard-page.js');
            // The module auto-initializes on load
            
            // Setup navigation links to open windows
            this.setupNavigationLinks(windowElement);
        } catch (error) {
            console.error('Error initializing Dashboard app:', error);
        }
    }

    /**
     * Setup navigation links to open windows instead of navigating
     */
    static setupNavigationLinks(windowElement) {
        const navLinks = windowElement.querySelectorAll('[data-open-app]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const appType = link.getAttribute('data-open-app');
                if (appType) {
                    // Dispatch event to open app window
                    window.dispatchEvent(new CustomEvent('openApp', { 
                        detail: { appType } 
                    }));
                }
            });
        });
    }

    /**
     * Initialize Auth app
     */
    static async initAuthApp(windowElement) {
        try {
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Import and initialize AuthPage
            const { default: AuthPage } = await import('./auth-page.js');
            const page = new AuthPage();
            // AuthPage.init() is called in constructor
        } catch (error) {
            console.error('Error initializing Auth app:', error);
        }
    }

    /**
     * Initialize Productivity menu
     */
    static initProductivityMenu(windowElement) {
        const buttons = windowElement.querySelectorAll('[data-open-app]');
        buttons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const appType = button.getAttribute('data-open-app');
                // Check authentication before opening
                const token = localStorage.getItem('authToken');
                if (!token) {
                    // Show message - will be handled by desktop
                    window.dispatchEvent(new CustomEvent('showAuthRequired'));
                    return;
                }
                // Dispatch event to desktop to open app
                window.dispatchEvent(new CustomEvent('openApp', { detail: { appType } }));
            });
        });
    }
}

