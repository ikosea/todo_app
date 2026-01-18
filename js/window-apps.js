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
            case 'todo':
                return this.getTodoContent();
            case 'pomodoro':
                return this.getPomodoroContent();
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
     * Get Todo app content
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
                <div class="mac-menu-item mac-menu-dropdown" id="user-menu">
                    <span id="menu-username">User</span>
                    <div class="mac-dropdown" id="user-dropdown">
                        <div class="mac-dropdown-item" id="logout-item">Logout</div>
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
                <!-- Dashboard Section -->
                <section class="dashboard-section">
                    <div class="user-greeting" id="user-greeting"></div>
                    <h2 class="section-title">Dashboard</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="today-count">0</div>
                            <div class="stat-label">Today</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="week-count">0</div>
                            <div class="stat-label">This Week</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="focus-minutes">0</div>
                            <div class="stat-label">Minutes</div>
                        </div>
                    </div>
                </section>

                <!-- Task List Section -->
                <section class="task-section">
                    <h2 class="section-title">Tasks</h2>
                    <div class="task-input-container">
                        <input type="text" id="task-input" class="mac-input" placeholder="Add a task...">
                        <button type="button" id="add-task" class="mac-button">Add</button>
                    </div>
                    <ul id="task-list" class="task-list"></ul>
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
                <div class="mac-menu-item mac-menu-dropdown" id="user-menu">
                    <span id="menu-username">User</span>
                    <div class="mac-dropdown" id="user-dropdown">
                        <div class="mac-dropdown-item" id="logout-item">Logout</div>
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
                <!-- Pomodoro Timer Section -->
                <section class="timer-section">
                    <div class="session-info" id="session-type">Work Session</div>
                    
                    <div class="active-task-display">
                        <div class="active-task-label">Focus</div>
                        <div class="active-task-text" id="active-task-text">No task selected</div>
                    </div>
                    
                    <div id="timer" class="timer-display">25:00</div>
                    <div class="focus-hint" id="focus-hint"></div>
                    
                    <div class="pomodoro-indicator">
                        <div class="pomodoro-circle" id="circle-1"></div>
                        <div class="pomodoro-circle" id="circle-2"></div>
                        <div class="pomodoro-circle" id="circle-3"></div>
                        <div class="pomodoro-circle" id="circle-4"></div>
                    </div>
                    
                    <div class="progress-container">
                        <div id="progress-bar" class="progress-bar"></div>
                    </div>
                    
                    <div class="controls">
                        <button id="start-btn" class="mac-button">Start</button>
                        <button id="pause-btn" class="mac-button" style="display:none;">Pause</button>
                        <button id="reset-btn" class="mac-button">Reset</button>
                        <button id="skip-btn" class="mac-button">Skip</button>
                    </div>
                </section>
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
     * Initialize Todo app
     */
    static async initTodoApp(windowElement) {
        try {
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Import and initialize TodoPage
            const { default: TodoPage } = await import('./todo-page.js');
            const page = new TodoPage();
            await page.init();
        } catch (error) {
            console.error('Error initializing Todo app:', error);
        }
    }

    /**
     * Initialize Pomodoro app
     */
    static async initPomodoroApp(windowElement) {
        try {
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Import and initialize PomodoroPage
            const { default: PomodoroPage } = await import('./pomodoro-page.js');
            const page = new PomodoroPage();
            await page.init();
        } catch (error) {
            console.error('Error initializing Pomodoro app:', error);
        }
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

