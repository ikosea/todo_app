# Productivity App - Desktop Environment

## Project Overview

A desktop-style productivity web application inspired by classic Macintosh System 7/8. The application provides a windowed desktop environment where users can manage tasks, track focus sessions with a Pomodoro timer, view productivity analytics, and manage deleted items through a trash system. All functionality is backed by a Flask API with SQLite database and JWT-based authentication.

The app runs entirely in the browser with a retro Macintosh aesthetic, featuring draggable windows, a custom cursor, and a menu bar. Users interact with the application through desktop icons that open apps in separate windows, creating a familiar desktop computing experience.

## Features

### Core Applications

- **Pomodoro Timer**: 25-minute focus sessions with 5-minute short breaks and 15-minute long breaks after 4 sessions
- **Task Management**: Create, manage, and track tasks with Pomodoro session counts
- **Dashboard**: Productivity analytics with session history, daily summaries, and GitHub-style focus streaks
- **Trash**: Deleted tasks are moved to trash for recovery or permanent deletion
- **Authentication**: Secure user registration and login system with JWT tokens

### Desktop Environment

- **Window System**: Apps open in draggable, resizable, focusable windows
- **Menu Bar**: Global menu bar with File, Edit, View, Label, and Special menus
- **Custom Cursor**: Pixelated Macintosh-style cursor that changes based on context
- **Desktop Icons**: Click icons to open apps in windows
- **Window Management**: Multiple windows, z-index stacking, minimize functionality

### User Experience

- **Landing Page**: Beautiful logo and sign in/sign up buttons for first-time users
- **Auto-redirect**: Smart routing based on authentication status
- **Cross-window Communication**: Real-time updates across all open windows
- **Persistent Storage**: Tasks and session data stored in backend database

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom Macintosh System 7/8 styling
- **JavaScript (ES6 Modules)** - Modern JavaScript with modules
- **Tailwind CSS** - Utility classes via CDN

### Backend
- **Flask 3.0.0** - Python web framework
- **SQLite** - Lightweight database
- **JWT (PyJWT)** - JSON Web Tokens for authentication
- **Werkzeug** - Password hashing (bcrypt)
- **Flask-CORS** - Cross-Origin Resource Sharing
- **Flask-Limiter** - Rate limiting
- **python-dotenv** - Environment variable management

## Installation / Setup

### Prerequisites

- **Python 3.7+** (for backend)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- **Local web server** (for frontend - required for ES6 modules)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` file** (copy from `.env.example` if available):
   ```bash
   # Create .env file with:
   SECRET_KEY=your-generated-secret-key-here
   ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
   DB_FILE=tasks.db
   ```

4. **Generate a secret key:**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   Copy the output and paste it into `.env` as `SECRET_KEY=...`

5. **Start the Flask backend:**
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Start a local web server** (from project root directory):

   **Option 1: Python HTTP Server**
   ```bash
   python -m http.server 8000
   ```

   **Option 2: Node.js http-server**
   ```bash
   npx http-server -p 8000
   ```

2. **Open in browser:**
   ```
   http://localhost:8000/index.html
   ```
   (This will automatically redirect to the landing page)

## Usage

### First-Time Users

1. Open `index.html` → Redirects to **Landing Page**
2. Landing page shows logo and "Sign In" / "Sign Up" buttons
3. Click button → Opens **Authentication Window**
4. Sign up or sign in → Redirects to **Desktop**
5. Click desktop icons to open apps (Pomodoro, Tasks, Dashboard, Trash)

### Returning Users

1. Open `index.html` → Checks authentication
2. If authenticated → Directly opens **Desktop**
3. If not authenticated → Shows **Landing Page**

### Using the Applications

**Pomodoro Timer:**
- Select a task from the dropdown
- Click "Start" to begin a 25-minute focus session
- Timer automatically tracks completed sessions
- After 4 sessions, a 15-minute long break is triggered

**Task Management:**
- Add new tasks using the input field
- View pomodoro count for each task
- Delete tasks (moves to trash)
- Tasks update in real-time across all open windows

**Dashboard:**
- View total sessions and focus time
- See session history by date
- View daily summaries
- Explore focus streaks with GitHub-style contribution graph
- Select different years to view historical data

**Trash:**
- View all deleted tasks
- Restore tasks back to active list
- Permanently delete tasks
- Empty trash to clear all deleted items

**Window Controls:**
- **Red button** - Close window
- **Yellow button** - Minimize window
- **Title bar** - Drag to move window
- **Bottom-right corner** - Resize window
- Click window to bring to front

**Menu Bar:**
- **Special** menu → Show Desktop, Close All Windows, Log Out

## Project Structure

```
todo_app/
├── index.html                    # Entry point - redirects to landing/auth/desktop
├── frontend/
│   ├── desktop.html              # Main desktop environment
│   ├── apps/
│   │   ├── landing.html         # Landing page with logo and auth buttons
│   │   ├── auth.html            # Authentication window
│   │   ├── pomodoro.html        # Pomodoro timer (standalone)
│   │   ├── todo.html            # Task management (standalone)
│   │   └── dashboard.html       # Analytics dashboard (standalone)
│   ├── css/
│   │   ├── desktop.css          # Desktop wallpaper, menu bar, icons
│   │   ├── window.css           # Window frames, title bars, controls
│   │   ├── cursor.css           # Custom Macintosh cursor
│   │   └── apps.css             # App-specific styling
│   ├── js/
│   │   ├── desktop.js           # Desktop environment logic
│   │   ├── windowManager.js     # Window creation, dragging, focus, z-index
│   │   ├── windowApps.js        # App content templates and initialization
│   │   ├── auth.js              # Authentication logic
│   │   ├── todo.js              # Task management
│   │   ├── pomodoro.js          # Pomodoro timer logic
│   │   ├── dashboard.js         # Analytics and statistics
│   │   ├── trash.js             # Trash management
│   │   ├── api.js               # Backend API communication
│   │   ├── config.js            # Centralized configuration
│   │   └── utils.js             # Utility functions
│   └── assets/
│       ├── cursors/             # Custom cursor images
│       └── icons/               # App icons
└── backend/
    ├── app.py                   # Flask application with auth and task routes
    ├── requirements.txt         # Python dependencies
    ├── .env.example             # Example environment variables
    └── tasks.db                 # SQLite database (auto-created)
```

## Limitations

- **Browser Compatibility**: Requires modern browsers (Chrome, Firefox, Edge, Safari). Internet Explorer is not supported.
- **Local Development Only**: Currently configured for local development. Production deployment requires additional configuration (CORS origins, environment variables, database setup).
- **Single User Database**: SQLite database is suitable for single-user or small-scale use. For multi-user production, consider PostgreSQL or MySQL.
- **No Real-time Collaboration**: Tasks and sessions are user-specific. No real-time collaboration features.
- **Offline Functionality**: Limited offline support. Service worker caches files, but full offline functionality is not implemented.
- **Window Maximize**: Green button (maximize) is not yet implemented.
- **File Menu**: Export/Import data features are placeholders and not fully implemented.
- **Rate Limiting**: Rate limiting uses in-memory storage. For production, use Redis or another persistent storage solution.
- **CORS Configuration**: Must be configured for production domains. Default allows only localhost.
- **No Email Verification**: User registration does not include email verification.
- **No Password Reset**: Password reset functionality is not implemented.

## Future Improvements

- **Enhanced Dashboard**: Add more analytics, charts, and insights into productivity patterns
- **Task Categories**: Organize tasks by categories or projects
- **Task Priorities**: Add priority levels to tasks
- **Task Due Dates**: Set deadlines and reminders for tasks
- **Pomodoro Customization**: Allow users to customize work/break durations
- **Sound Customization**: Allow users to choose notification sounds
- **Theme Customization**: Additional themes beyond Macintosh System 7/8
- **Keyboard Shortcuts**: Add keyboard shortcuts for common actions
- **Window Maximize**: Implement full window maximize functionality
- **Data Export/Import**: Complete implementation of data export and import features
- **Offline Mode**: Full offline functionality with automatic sync when online
- **Mobile Responsive**: Adapt the desktop environment for mobile devices
- **Dark Mode**: Add a dark mode option
- **Task Templates**: Pre-defined task templates for common workflows
- **Session Statistics**: More detailed statistics on focus patterns and productivity trends
- **Multi-language Support**: Internationalization for multiple languages
- **Accessibility**: Enhanced keyboard navigation and screen reader support
- **PWA Features**: Make the app installable as a Progressive Web App
- **Backup and Sync**: Cloud backup and sync across devices

## License

This project is for educational/personal use.

## Credits

- UI Design: Inspired by Macintosh System 7/8
- Icons: Custom SVG icons in Macintosh style
- Cursor: Custom pixelated cursor images
