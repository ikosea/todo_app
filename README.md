# Productivity App - Desktop Environment

## Project Overview

A desktop-style productivity web application inspired by classic Macintosh System 7/8. The application provides a windowed desktop environment where users can manage tasks, track focus sessions with a Pomodoro timer, view productivity analytics, practice meditation, play ambient sounds, and customize their experience with dark retro themes. All functionality is backed by a Flask API with SQLite database and JWT-based authentication.

The app runs entirely in the browser with a retro Macintosh aesthetic, featuring draggable windows, draggable desktop icons, a custom cursor, and a menu bar. Users interact with the application through desktop icons that open apps in separate windows, creating a familiar desktop computing experience.

## Features

### Core Applications

- **Pomodoro Timer**: 25-minute focus sessions with 5-minute short breaks and 15-minute long breaks after 4 sessions
- **Task Management**: Create, manage, and track tasks with Pomodoro session counts
- **Dashboard**: Productivity analytics with session history, daily summaries, and GitHub-style focus streaks with year selector
- **Folder**: Categorized task lists (Urgent, Important, Not Important) with local storage
- **Trash**: Deleted tasks are moved to trash for recovery or permanent deletion
- **Ambient Noise**: Procedural background sounds (white noise, rain, coffee shop, waves) for focus
- **Meditation**: Breathing exercises (Box Breathing, 4-7-8, Deep Breathing, Equal Breathing) with visual guides
- **Tutorial**: Interactive first-time user guide with step-by-step instructions
- **About**: Author information, contribution notes, and feedback links
- **Authentication**: Secure user registration and login system with JWT tokens

### Desktop Environment

- **Window System**: Apps open in draggable, resizable, focusable windows
- **Draggable Icons**: Desktop icons can be dragged and repositioned (positions saved per user)
- **Menu Bar**: Global menu bar with File, Edit, View, Label, and Special menus
- **Custom Cursor**: Pixelated Macintosh-style cursor that changes based on context
- **Desktop Icons**: Click icons to open apps in windows
- **Window Management**: Multiple windows, z-index stacking, minimize functionality

### Customization & Themes

- **Dark Retro Themes**: Three dark themes inspired by 90s Mac aesthetics
  - **Dark + Pink**: Charcoal background with neon pink accents
  - **Dark + Violet**: Dark purple with violet accents
  - **Dark + Grey**: Neutral dark with blue/aqua accents
- **Display Settings**: Adjustable brightness, contrast, and saturation for desktop wallpaper (0-200% range)
- **Theme Persistence**: Selected theme and display settings saved per user

### User Experience

- **Landing Page**: Beautiful clock-style logo and sign in/sign up buttons for first-time users
- **Auto-redirect**: Smart routing based on authentication status
- **Cross-window Communication**: Real-time updates across all open windows
- **Persistent Storage**: Tasks and session data stored in backend database
- **Offline Support**: Service worker and IndexedDB for offline functionality with sync when online
- **Data Export/Import**: Export all user data (tasks, session history) as JSON and import to restore

### Security & Performance

- **Environment Variables**: Sensitive configuration stored in `.env` file
- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: API endpoints protected from abuse
- **Input Validation**: Password length, email format validation
- **JWT Authentication**: Secure token-based session management

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom Macintosh System 7/8 styling with CSS variables for theming
- **JavaScript (ES6 Modules)** - Modern JavaScript with modules
- **Tailwind CSS** - Utility classes via CDN
- **Service Worker** - Offline support and caching
- **IndexedDB** - Local data storage for offline functionality
- **Web Audio API** - Procedural audio generation for ambient sounds

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

3. **Create `.env` file:**
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
   The backend will run on `http://127.0.0.1:5000` (or `http://localhost:5000`)

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
2. Landing page shows clock logo and "Sign In" / "Sign Up" buttons
3. Click button → Opens **Authentication Window**
4. Sign up or sign in → Redirects to **Desktop**
5. Tutorial window opens automatically (can be reopened via Help icon)
6. Click desktop icons to open apps

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

**Folder:**
- Organize tasks by urgency (Urgent, Important, Not Important)
- Tasks stored locally in browser
- Quick access to categorized lists

**Ambient Noise:**
- Select sound type (white noise, rain, coffee shop, waves)
- Adjust volume slider
- Procedural audio (no external files)
- Minimize window to keep playing while working

**Meditation:**
- Choose breathing technique (Box Breathing, 4-7-8, Deep Breathing, Equal Breathing)
- Follow visual guide and timer
- Track completed cycles

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

**Desktop Icons:**
- **Click** - Open app in window
- **Drag** - Reposition icon (position saved automatically)

**Menu Bar:**
- **File** → Export Data, Import Data
- **View** → Theme selection (Default, Dark + Pink, Dark + Violet, Dark + Grey), Display Settings...
- **Special** → Show Desktop, Close All Windows, Log Out

**Display Settings:**
- Access via View → Display Settings...
- Adjust **Brightness** (0-200%) - Control overall wallpaper brightness
- Adjust **Contrast** (0-200%) - Control color contrast
- Adjust **Saturation** (0-200%) - Control color intensity
- Settings apply in real-time to desktop wallpaper
- Settings automatically saved and persist across sessions
- Reset button to restore default values (100% each)

## Project Structure

```
todo_app/
├── index.html                     # Entry point (redirects to landing page)
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
├── frontend/                      # Modular frontend (static files)
│   ├── desktop.html               # Desktop environment shell
│   ├── apps/                      # Standalone app pages
│   │   ├── landing.html           # Landing page with logo
│   │   └── auth.html              # Authentication page
│   ├── css/                       # Styling (split by concern)
│   │   ├── desktop.css            # Desktop wallpaper, menu bar, icons
│   │   ├── window.css             # Window frames, title bars, controls
│   │   ├── cursor.css             # Custom cursor styles
│   │   ├── apps.css               # Application-specific styles
│   │   └── themes.css             # Dark retro theme variables and styles
│   ├── js/                        # ES modules (split by feature)
│   │   ├── desktop.js             # Desktop environment manager
│   │   ├── windowManager.js       # Window creation, dragging, z-index
│   │   ├── windowApps.js          # App content templates and initialization
│   │   ├── auth.js                # Authentication logic
│   │   ├── api.js                 # Backend API communication
│   │   ├── config.js              # Centralized configuration
│   │   ├── utils.js               # Utility functions
│   │   ├── pomodoro.js            # Pomodoro timer logic
│   │   ├── todo.js                # Task management
│   │   ├── dashboard.js           # Analytics and statistics
│   │   ├── trash.js               # Trash management
│   │   ├── folder.js              # Categorized task lists
│   │   ├── ambient.js             # Procedural ambient noise generator
│   │   ├── meditation.js          # Breathing exercises
│   │   ├── tutorial.js            # First-time user guide
│   │   ├── about.js               # About/feedback window
│   │   ├── settings.js            # Display settings (brightness, contrast, saturation)
│   │   └── offline.js             # Offline support and IndexedDB
│   ├── assets/
│   │   ├── cursors/               # Custom cursor images (.cur files)
│   │   │   ├── Normal Select.cur
│   │   │   ├── Link Select.cur
│   │   │   ├── Help Select.cur
│   │   │   └── Busy.cur
│   │   └── logo.svg               # Clock-style logo
│   └── sw.js                      # Service worker for offline support
└── backend/                        # Flask API
    ├── app.py                     # Main Flask application
    ├── requirements.txt            # Python dependencies
    ├── .env                        # Environment variables (not in git)
    └── tasks.db                    # SQLite database (auto-created)
```

## License

This project is for educational/personal use.

## Credits

- **Author**: [Ikosea](https://github.com/ikosea)
- **UI Design**: Inspired by Macintosh System 7/8
- **Icons**: Custom SVG icons in Macintosh style
- **Cursor**: Custom pixelated cursor images
- **Themes**: Dark retro themes inspired by 90s Mac aesthetics

## Feedback & Contributions

Feedback, bug reports, and feature suggestions are welcome! You can:
- Open an issue on [GitHub](https://github.com/ikosea)
- Visit the About (Ikosea) icon on the desktop for more information
