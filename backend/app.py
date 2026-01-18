from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database file
DB_FILE = "tasks.db"

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            text TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            pomodoroCount INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
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

# User Registration
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    
    if not data or "username" not in data or "email" not in data or "password" not in data:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if username already exists
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Username already exists"}), 400
    
    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Email already exists"}), 400
    
    # Hash password
    password_hash = generate_password_hash(password)
    
    # Insert new user
    cursor.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        (username, email, password_hash)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        "message": "User created successfully",
        "user": {
            "id": user_id,
            "username": username,
            "email": email
        }
    }), 201

# User Login
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password are required"}), 400
    
    username_or_email = data["username"].strip()
    password = data["password"]
    
    if not username_or_email or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Find user by username or email
    cursor.execute(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        (username_or_email, username_or_email.lower())
    )
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Verify password
    if not check_password_hash(user["password_hash"], password):
        conn.close()
        return jsonify({"error": "Invalid username or password"}), 401
    
    conn.close()
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }), 200

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
