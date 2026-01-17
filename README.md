# 📌 Productivity App - Pomodoro Timer & Todo List

A classic 1990s Macintosh System 7/8 styled productivity web application featuring a Pomodoro timer and task management system.

![Macintosh Style UI](https://img.shields.io/badge/Style-Macintosh%20System%207-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎯 Overview

This is a beginner-friendly productivity web app that combines:
- **Pomodoro Timer** - Focus sessions with work/break cycles
- **Todo List** - Task management with Pomodoro tracking
- **Dashboard** - Statistics and progress tracking

The entire UI is designed to emulate the classic Macintosh System 7/8 interface from the 1990s, featuring:
- Flat, light-gray UI (#c0c0c0 background)
- Thick black borders
- Hard, offset shadows
- No rounded corners, gradients, or blur effects
- Classic Mac button styling with "pressed-in" active states

## ✨ Features

### Landing Page
- Welcome screen with navigation to main features
- Full-screen Mac-style window
- Simple, clean interface

### Pomodoro Timer Page
- ⏱️ 25-minute work sessions
- ☕ 5-minute short breaks
- 🎯 15-minute long breaks (after 4 pomodoros)
- Visual progress bar
- Pomodoro indicator (4 circles)
- Start, Pause, Reset, and Skip controls
- Active task display
- Notification sound when sessions end

### Todo & Dashboard Page
- ✅ Create, select, and delete tasks
- 📊 Dashboard statistics:
  - Today's completed pomodoros
  - This week's completed pomodoros
  - Total focus minutes
- Task selection (for Pomodoro timer)
- Pomodoro count tracking per task
- Persistent storage (localStorage)

## 🗂️ Project Structure

```
todo_app/
├── index.html              # Landing page
├── pomodoro.html          # Pomodoro timer page
├── todo.html              # Todo & Dashboard page
├── retro.css              # Classic Macintosh styling
├── style.css              # (Legacy file, not used)
├── README.md              # This file
│
└── js/                    # JavaScript modules
    ├── app.js             # (Legacy, not used in multi-page version)
    ├── pomodoro-page.js   # Pomodoro page controller
    ├── todo-page.js       # Todo page controller
    ├── timer.js           # Timer logic module
    ├── tasks.js           # Task management module
    ├── ui.js              # UI rendering module
    └── storage.js         # localStorage operations
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (for local server) OR any HTTP server

### Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd todo_app
   ```

2. **No build process required!** This is a vanilla JavaScript project.

### Running the Application

**Important:** You must use a local web server. Opening HTML files directly won't work due to ES6 module CORS restrictions.

#### Option 1: Python HTTP Server (Recommended)

```bash
# Navigate to project directory
cd todo_app

# Start server on port 8000
python -m http.server 8000
```

Then open in your browser:
- **Landing Page:** http://localhost:8000/index.html
- **Pomodoro Timer:** http://localhost:8000/pomodoro.html
- **Todo & Dashboard:** http://localhost:8000/todo.html

#### Option 2: Node.js HTTP Server

```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server
http-server -p 8000
```

#### Option 3: VS Code Live Server

If you use VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## 📖 Usage Guide

### Landing Page

1. Open `http://localhost:8000/index.html`
2. Click either:
   - **Pomodoro Timer** - Go to timer page
   - **Todo & Dashboard** - Go to task management page

### Using the Pomodoro Timer

1. **Select a Task First:**
   - Go to the Todo page
   - Create a task or select an existing one
   - The selected task will appear on the Pomodoro page

2. **Start a Session:**
   - Navigate to the Pomodoro Timer page
   - Click **Start** to begin a 25-minute work session
   - The timer counts down and shows progress

3. **Session Controls:**
   - **Pause** - Temporarily stop the timer
   - **Reset** - Reset to full session duration
   - **Skip** - End current session and move to next

4. **Break Sessions:**
   - After a work session, a break automatically starts
   - Short breaks (5 min) after 1-3 pomodoros
   - Long break (15 min) after 4 pomodoros

5. **Pomodoro Indicator:**
   - Four circles show progress
   - Fills up as you complete pomodoros
   - Resets after 4 completed sessions

### Managing Tasks

1. **Create a Task:**
   - Go to Todo & Dashboard page
   - Type task name in the input field
   - Click **Add** or press **Enter**

2. **Select a Task:**
   - Click on any task in the list
   - Selected task has black background with white text
   - Selected task appears on Pomodoro page

3. **Delete a Task:**
   - Click the **✕** button on any task
   - Task is permanently removed

4. **View Statistics:**
   - Dashboard shows:
     - **Today:** Number of pomodoros completed today
     - **This Week:** Number of pomodoros this week
     - **Minutes:** Total focus minutes from all sessions

## 🏗️ Architecture

### Modular JavaScript Design

The application uses ES6 modules for clean code organization:

#### `js/storage.js`
- Handles all localStorage operations
- Saves/loads tasks, session history, and selected task ID
- **Methods:**
  - `saveTasks(tasks)` - Save task list
  - `loadTasks()` - Load task list
  - `saveHistory(history)` - Save session history
  - `loadHistory()` - Load session history
  - `saveSelectedTaskId(taskId)` - Save selected task
  - `loadSelectedTaskId()` - Load selected task

#### `js/timer.js`
- Manages Pomodoro timer logic and state
- **Properties:**
  - `WORK_DURATION: 25` minutes
  - `SHORT_BREAK_DURATION: 5` minutes
  - `LONG_BREAK_DURATION: 15` minutes
- **Methods:**
  - `init()` - Initialize timer
  - `start()` - Start timer
  - `pause()` - Pause timer
  - `reset()` - Reset to session duration
  - `skip()` - Skip to next session
  - `getFormattedTime()` - Get MM:SS format
  - `getProgress()` - Get percentage complete

#### `js/tasks.js`
- Task CRUD operations
- **Methods:**
  - `init(tasks, selectedTaskId)` - Initialize with saved data
  - `add(text)` - Add new task
  - `remove(taskId)` - Delete task
  - `select(taskId)` - Select task for Pomodoro
  - `getTask(taskId)` - Get task by ID
  - `incrementPomodoro()` - Increment count for selected task

#### `js/ui.js`
- DOM manipulation and rendering
- **Methods:**
  - `init()` - Initialize DOM element references
  - `updateTimer(timeString)` - Update timer display
  - `updateProgress(percentage)` - Update progress bar
  - `renderTasks(tasks, selectedId, isRunning)` - Render task list
  - `updatePomodoroIndicator(count)` - Update circles

#### `js/pomodoro-page.js`
- Controller for Pomodoro Timer page
- Coordinates Timer, Tasks, and UI modules
- Handles session end logic and notifications

#### `js/todo-page.js`
- Controller for Todo & Dashboard page
- Manages task creation and selection
- Updates dashboard statistics

### Data Flow

```
User Action
    ↓
Page Controller (pomodoro-page.js / todo-page.js)
    ↓
Module (Timer / Tasks)
    ↓
Storage (localStorage)
    ↓
UI Update (ui.js)
```

## 🎨 Styling

### Design Principles

The app follows strict 1990s Macintosh System 7/8 design constraints:

- ✅ **Flat colors** - No gradients
- ✅ **Hard shadows** - 4px offset, solid black
- ✅ **Thick borders** - 2px solid black
- ✅ **No rounded corners** - Sharp 90-degree angles
- ✅ **Classic fonts** - Geneva/Chicago
- ✅ **Pressed buttons** - Inset shadows when active
- ✅ **Finder-style selection** - Black bg + white text

### Color Palette

```css
--mac-gray: #c0c0c0      /* Main background */
--mac-dark-gray: #808080 /* Title bar, borders */
--mac-light-gray: #e0e0e0 /* Hover states */
--mac-white: #ffffff     /* Content areas */
--mac-black: #000000     /* Text, borders */
```

### CSS Structure

- `retro.css` - All styling
- Tailwind CDN - Only for layout utilities (flex, grid, spacing)
- Custom CSS - All visual styling (colors, borders, shadows)

## 🔧 Troubleshooting

### CORS Error: "Access to script blocked"

**Problem:** Opening HTML files directly from file system.

**Solution:** Use a local web server (see "Running the Application" above).

### Tasks Not Adding

**Check:**
1. Server is running on `http://localhost:8000`
2. Browser console for JavaScript errors
3. Input field is not empty
4. Button has `type="button"` attribute

### Timer Not Starting

**Check:**
1. A task is selected (go to Todo page first)
2. Browser console for errors
3. Timer state is not already running

### Data Not Persisting

**Check:**
1. Browser allows localStorage (not in private/incognito mode)
2. localStorage is not disabled
3. Browser console for storage errors

### Styles Not Loading

**Check:**
1. `retro.css` file exists in project root
2. Path in HTML: `<link rel="stylesheet" href="retro.css">`
3. Browser DevTools Network tab shows CSS loaded

## 📝 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Internet Explorer (not supported - uses ES6 modules)

## 🛠️ Development

### Adding New Features

1. **New Page:**
   - Create HTML file
   - Create corresponding `js/[page-name]-page.js`
   - Import required modules
   - Initialize on DOMContentLoaded

2. **New Module:**
   - Create in `js/` directory
   - Use ES6 `export`
   - Import where needed with `import`

3. **Styling:**
   - Add to `retro.css`
   - Follow Macintosh design constraints
   - Use Tailwind only for layout

### Code Style

- Use clear, descriptive variable names
- Comment complex logic
- Keep functions focused (single responsibility)
- Use ES6+ features (arrow functions, const/let, modules)

## 📚 Learning Resources

### Concepts Used

- **ES6 Modules** - Import/export for code organization
- **localStorage** - Browser storage API
- **DOM Manipulation** - Creating and updating elements
- **Event Listeners** - User interaction handling
- **CSS Flexbox/Grid** - Layout (via Tailwind)
- **CSS Custom Properties** - Design system

### Recommended Reading

- [MDN: ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🐛 Known Issues

- Tailwind CDN warning (informational, safe to ignore)
- Timer continues in background if page is closed (by design)
- No task completion checkbox (tasks are selected, not completed)

## 🔮 Future Enhancements

Potential features to add:
- [ ] Task completion status
- [ ] Task categories/tags
- [ ] Sound customization
- [ ] Dark mode (while keeping retro style)
- [ ] Export/import data
- [ ] Task due dates
- [ ] Pomodoro history charts

## 📄 License

This is an educational project. Feel free to use and modify as needed.

## 👤 Author

Created as a beginner-friendly project demonstrating:
- Multi-page web applications
- Modular JavaScript architecture
- Classic UI design
- Vanilla JavaScript (no frameworks)

## 🙏 Acknowledgments

- Design inspiration: Classic Macintosh System 7/8
- Pomodoro Technique: Francesco Cirillo
- Tailwind CSS: For utility-first CSS framework

---

**Happy Coding! 🚀**

For questions or issues, check the Troubleshooting section above or review the browser console for error messages.

