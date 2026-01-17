from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Database file
DB_FILE = "tasks.db"

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            pomodoroCount INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

# Get database connection
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database on startup
init_db()

# Home route
@app.route("/")
def hello():
    return jsonify({"message": "Backend is running"})

# Get all tasks
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()
    conn.close()
    
    tasks = [dict(row) for row in rows]
    return jsonify({"tasks": tasks})

# Add a new task
@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    
    if not data or "text" not in data:
        return jsonify({"error": "Task text is required"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (text, completed, pomodoroCount) VALUES (?, ?, ?)",
        (data["text"], 0, 0)
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    new_task = {
        "id": task_id,
        "text": data["text"],
        "completed": 0,
        "pomodoroCount": 0
    }
    
    return jsonify(new_task), 201

# Delete a task
@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    task = cursor.fetchone()
    
    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404
    
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Task deleted"}), 200

# Update task pomodoro count
@app.route("/api/tasks/<int:task_id>/pomodoro", methods=["POST"])
def increment_pomodoro(task_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    task = cursor.fetchone()
    
    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404
    
    new_count = dict(task)["pomodoroCount"] + 1
    cursor.execute(
        "UPDATE tasks SET pomodoroCount = ? WHERE id = ?",
        (new_count, task_id)
    )
    conn.commit()
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    updated_task = cursor.fetchone()
    conn.close()
    
    return jsonify(dict(updated_task)), 200

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)
