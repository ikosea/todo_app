# Application Restructure Plan

## Current Status
The application needs to be restructured to match the specified architecture. This document outlines the plan.

## New File Structure

```
productivity-app/
├── backend/
│   ├── app.py (Flask entry point)
│   ├── database.db (SQLite database - rename from tasks.db)
│   └── requirements.txt
└── frontend/
    ├── desktop.html (main entry point)
    ├── css/
    │   ├── desktop.css (wallpaper, menu bar, icons)
    │   ├── window.css (window frames, title bars, controls)
    │   ├── cursor.css (custom Macintosh cursor)
    │   └── apps.css (todo, pomodoro, dashboard styling)
    ├── js/
    │   ├── desktop.js (desktop logic, icon selection)
    │   ├── windowManager.js (window creation, drag, focus, z-index)
    │   ├── auth.js (sign up, sign in, session handling)
    │   ├── todo.js (task CRUD, completion logic)
    │   ├── pomodoro.js (timer, tomato blocks, session tracking)
    │   └── dashboard.js (analytics display)
    ├── apps/
    │   ├── auth.html
    │   ├── todo.html
    │   ├── pomodoro.html
    │   └── dashboard.html
    └── assets/
        ├── icons/
        └── cursors/
```

## Migration Steps

1. ✅ Create directory structure
2. ⏳ Split retro.css into separate files
3. ⏳ Create new JavaScript modules
4. ⏳ Move HTML files to frontend/apps/
5. ⏳ Move cursor files to frontend/assets/cursors/
6. ⏳ Update all file references
7. ⏳ Test all functionality

## Key Changes

- All apps run inside desktop windows (no page navigation)
- Backend is source of truth (no localStorage for tasks)
- Authentication required for productivity apps
- Window system handles all app interactions
- CSS split by responsibility
- JavaScript split by functionality

