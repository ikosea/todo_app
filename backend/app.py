from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import jwt
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get configuration from environment variables with fallbacks
SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(32).hex())
# Comma-separated list of allowed frontend origins.
# In local dev, allowing "*" avoids common Windows host/IP mismatches (localhost vs 127.0.0.1 vs LAN IP).
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')

app.config['SECRET_KEY'] = SECRET_KEY

# Configure CORS
_allow_all_origins = any(o.strip() == '*' for o in ALLOWED_ORIGINS)
CORS(
    app,
    origins="*" if _allow_all_origins else [o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    # We don't use cookies for auth; disabling credentials avoids invalid "*" + credentials combinations.
    supports_credentials=False,
)

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Ensure CORS headers are added to all responses (flask-cors handles this, but keep for compatibility)
@app.after_request
def after_request(response):
    # CORS is mostly handled by flask-cors, but ensure preflight responses include
    # the headers browsers require (especially for Authorization + JSON POSTs).
    origin = request.headers.get('Origin')

    # Allow origin
    if _allow_all_origins:
        response.headers.setdefault('Access-Control-Allow-Origin', '*')
    elif origin and origin in [o.strip() for o in ALLOWED_ORIGINS]:
        response.headers.setdefault('Access-Control-Allow-Origin', origin)

    # Handle OPTIONS preflight
    if request.method == 'OPTIONS':
        # Allow methods
        response.headers.setdefault('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

        # Allow headers (either echo requested headers, or default to the ones we need)
        requested = request.headers.get('Access-Control-Request-Headers')
        if requested:
            response.headers.setdefault('Access-Control-Allow-Headers', requested)
        else:
            response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        # Cache preflight for a day (dev friendly)
        response.headers.setdefault('Access-Control-Max-Age', '86400')

    return response

# Global error handler to ensure CORS headers on errors
@app.errorhandler(Exception)
def handle_error(e):
    from flask import make_response
    import traceback
    print(f"Error: {str(e)}")
    print(traceback.format_exc())
    response = make_response(jsonify({"error": "Internal server error"}), 500)
    origin = request.headers.get('Origin')
    if _allow_all_origins:
        response.headers.add('Access-Control-Allow-Origin', '*')
    elif origin and origin in [o.strip() for o in ALLOWED_ORIGINS]:
        response.headers.add('Access-Control-Allow-Origin', origin)
    return response

# Authentication middleware
def verify_token(f):
    from flask import make_response
    def wrapper(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except:
                response = make_response(jsonify({"error": "Invalid token format"}), 401)
                if _allow_all_origins:
                    response.headers.add('Access-Control-Allow-Origin', '*')
                return response
        
        if not token:
            response = make_response(jsonify({"error": "Authentication required"}), 401)
            if _allow_all_origins:
                response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.current_user_id = data['user_id']
            request.current_username = data['username']
        except jwt.ExpiredSignatureError:
            response = make_response(jsonify({"error": "Token expired"}), 401)
            if _allow_all_origins:
                response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        except jwt.InvalidTokenError:
            response = make_response(jsonify({"error": "Invalid token"}), 401)
            if _allow_all_origins:
                response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

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
    
    # Migration: Add user_id column if it doesn't exist (for existing databases)
    try:
        cursor.execute("SELECT user_id FROM tasks LIMIT 1")
    except sqlite3.OperationalError:
        # Column doesn't exist, add it
        print("Migrating database: Adding user_id column to tasks table...")
        cursor.execute("ALTER TABLE tasks ADD COLUMN user_id INTEGER")
        # Set existing tasks to user_id = 1 (or NULL if you prefer)
        cursor.execute("UPDATE tasks SET user_id = 1 WHERE user_id IS NULL")
        print("Migration complete!")
    
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

# Input validation helpers
def validate_username(username):
    if not username or len(username.strip()) < 3:
        return False, "Username must be at least 3 characters"
    if len(username) > 50:
        return False, "Username must be less than 50 characters"
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, None

def validate_email(email):
    if not email:
        return False, "Email is required"
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    return True, None

def validate_password(password):
    if not password:
        return False, "Password is required"
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    return True, None

# User Registration
@app.route("/api/auth/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    
    if not data or "username" not in data or "email" not in data or "password" not in data:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    
    # Validate inputs
    valid, error = validate_username(username)
    if not valid:
        return jsonify({"error": error}), 400
    
    valid, error = validate_email(email)
    if not valid:
        return jsonify({"error": error}), 400
    
    valid, error = validate_password(password)
    if not valid:
        return jsonify({"error": error}), 400
    
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
@limiter.limit("10 per minute")
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
    
    # Generate JWT token (expires in 7 days)
    token = jwt.encode({
        'user_id': user["id"],
        'username': user["username"],
        'exp': datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    # Ensure token is a string (PyJWT 2.x returns string, but be explicit)
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    
    conn.close()
    
    return jsonify({
        "message": "Login successful",
        "token": str(token),
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }), 200

# Get current user
@app.route("/api/auth/me", methods=["GET"])
@verify_token
@limiter.limit("100 per hour")
def get_current_user():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE id = ?", (request.current_user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(dict(user)), 200

# Get all tasks (protected - user-specific)
@app.route("/api/tasks", methods=["GET"])
@verify_token
def get_tasks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE user_id = ?", (request.current_user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    tasks = [dict(row) for row in rows]
    return jsonify({"tasks": tasks})

# Add a new task (protected - user-specific)
@app.route("/api/tasks", methods=["POST"])
@verify_token
@limiter.limit("50 per hour")
def add_task():
    data = request.get_json()
    
    if not data or "text" not in data:
        return jsonify({"error": "Task text is required"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (user_id, text, completed, pomodoroCount) VALUES (?, ?, ?, ?)",
        (request.current_user_id, data["text"], 0, 0)
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    new_task = {
        "id": task_id,
        "user_id": request.current_user_id,
        "text": data["text"],
        "completed": 0,
        "pomodoroCount": 0
    }
    
    return jsonify(new_task), 201

# Delete a task (protected - user-specific)
@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@verify_token
@limiter.limit("50 per hour")
def delete_task(task_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, request.current_user_id))
    task = cursor.fetchone()
    
    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404
    
    cursor.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, request.current_user_id))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Task deleted"}), 200

# Update task pomodoro count (protected - user-specific)
@app.route("/api/tasks/<int:task_id>/pomodoro", methods=["POST"])
@verify_token
@limiter.limit("200 per hour")
def increment_pomodoro(task_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, request.current_user_id))
    task = cursor.fetchone()
    
    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404
    
    new_count = dict(task)["pomodoroCount"] + 1
    cursor.execute(
        "UPDATE tasks SET pomodoroCount = ? WHERE id = ? AND user_id = ?",
        (new_count, task_id, request.current_user_id)
    )
    conn.commit()
    cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, request.current_user_id))
    updated_task = cursor.fetchone()
    conn.close()
    
    return jsonify(dict(updated_task)), 200

if __name__ == "__main__":
    # Bind to all IPv4 interfaces to avoid Windows localhost/IPv6 resolution issues.
    # Access it via http://127.0.0.1:5000
    app.run(debug=True, host='0.0.0.0', port=5000)
