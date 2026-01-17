# Productivity App - Pomodoro Timer & Todo List

A web application featuring a Pomodoro timer and task management system with a classic Macintosh System 7/8 styled interface.

## Features

- **Pomodoro Timer**: 25-minute work sessions with 5-minute short breaks and 15-minute long breaks
- **Todo List**: Create, select, and delete tasks
- **Dashboard**: Statistics for daily, weekly pomodoros and total focus minutes
- **Persistent Storage**: Data saved in browser localStorage

## Project Structure

```
todo_app/
├── index.html              # Landing page
├── pomodoro.html          # Pomodoro timer page
├── todo.html              # Todo & Dashboard page
├── retro.css              # Macintosh styling
├── js/                    # JavaScript files
│   ├── pomodoro-page.js   # Timer page controller
│   ├── todo-page.js       # Todo page controller
│   ├── timer.js           # Timer logic
│   ├── tasks.js           # Task management
│   ├── ui.js              # UI rendering
│   └── storage.js         # localStorage operations
└── backend/               # Flask backend
    ├── app.py             # Flask application
    └── requirements.txt   # Python dependencies
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x

### Running the Frontend

1. Start a local web server:
   ```bash
   python -m http.server 8000
   ```

2. Open in browser:
   - Landing Page: http://localhost:8000/index.html
   - Pomodoro Timer: http://localhost:8000/pomodoro.html
   - Todo & Dashboard: http://localhost:8000/todo.html

### Running the Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start Flask server:
   ```bash
   python app.py
   ```

4. Server runs on: http://localhost:5000

## Usage

### Pomodoro Timer

1. Select a task on the Todo page
2. Navigate to Pomodoro Timer page
3. Click Start to begin a 25-minute work session
4. Use Pause, Reset, or Skip controls as needed

### Task Management

1. Go to Todo & Dashboard page
2. Enter task name and click Add
3. Click a task to select it for Pomodoro timer
4. Click X to delete a task

## Architecture

The application uses ES6 modules for code organization:

- **storage.js**: Handles localStorage operations
- **timer.js**: Manages Pomodoro timer logic
- **tasks.js**: Task CRUD operations
- **ui.js**: DOM manipulation and rendering
- **pomodoro-page.js**: Timer page controller
- **todo-page.js**: Todo page controller

## Troubleshooting

### CORS Error

**Solution**: Use a local web server. Do not open HTML files directly from the file system.

### Tasks Not Adding

**Check**: Server is running on http://localhost:8000 and browser console for errors.

### Backend Connection Failed

**Check**: Flask server is running on http://localhost:5000 and terminal shows "Running on http://127.0.0.1:5000".

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Internet Explorer (not supported)

## Technologies

- HTML5
- CSS3 (Custom retro styling)
- JavaScript (ES6 Modules)
- Tailwind CSS (CDN for layout)
- Flask (Python backend)
