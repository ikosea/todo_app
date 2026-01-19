/**
 * Configuration Constants
 * Centralized configuration for the application
 */

export const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:5000/api',
        ENDPOINTS: {
            TASKS: '/tasks',
            AUTH: {
                LOGIN: '/auth/login',
                REGISTER: '/auth/register',
                ME: '/auth/me'
            }
        }
    },

    // Timer Configuration
    TIMER: {
        WORK_DURATION: 25,        // minutes
        SHORT_BREAK_DURATION: 5,  // minutes
        LONG_BREAK_DURATION: 15,  // minutes
        POMODOROS_PER_LONG_BREAK: 4
    },

    // Window Configuration
    WINDOW: {
        DEFAULT_WIDTH: 600,
        DEFAULT_HEIGHT: 500,
        MIN_WIDTH: 400,
        MIN_HEIGHT: 300,
        DEFAULT_X: 100,
        DEFAULT_Y: 100,
        MENU_BAR_HEIGHT: 22,
        INITIAL_Z_INDEX: 101
    },

    // Storage Keys
    STORAGE: {
        AUTH_TOKEN: 'authToken',
        CURRENT_USER: 'currentUser',
        SELECTED_TASK: 'selectedTaskId',
        SESSION_HISTORY: 'sessionHistory'
    },

    // App Types
    APP_TYPES: {
        PRODUCTIVITY: 'productivity',
        POMODORO: 'pomodoro',
        TODO: 'todo',
        DASHBOARD: 'dashboard',
        AUTH: 'auth',
        FOLDER: 'folder',
        TRASH: 'trash'
    },

    // Window Titles
    WINDOW_TITLES: {
        'productivity': 'Productivity App',
        'pomodoro': 'Pomodoro Timer',
        'todo': 'Task Management',
        'dashboard': 'Productivity Dashboard',
        'auth': 'Authentication',
        'folder': 'Folder',
        'trash': 'Trash'
    },

    // Cursor Types
    CURSOR: {
        NORMAL: 'normal',
        POINTER: 'pointer',
        TEXT: 'text',
        HELP: 'help',
        BUSY: 'busy'
    },

    // Cursor File Paths
    CURSOR_PATHS: {
        'normal': 'assets/cursors/Normal Select.cur',
        'pointer': 'assets/cursors/Link Select.cur',
        'help': 'assets/cursors/Help Select.cur',
        'busy': 'assets/cursors/Busy.cur'
    },

    // Delays
    DELAYS: {
        DOM_READY: 50,
        DOM_READY_LONG: 100,
        ICON_DESELECT: 200
    }
};
