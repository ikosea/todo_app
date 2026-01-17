from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory storage for tasks (temporary, no database yet)
tasks = []
next_id = 1

# Home route
@app.route("/")
def hello():
    return jsonify({"message": "Backend is running"})

# Get all tasks
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify({"tasks": tasks})

# Add a new task
@app.route("/api/tasks", methods=["POST"])
def add_task():
    global next_id
    data = request.get_json()
    
    if not data or "text" not in data:
        return jsonify({"error": "Task text is required"}), 400
    
    new_task = {
        "id": next_id,
        "text": data["text"],
        "completed": False,
        "pomodoroCount": 0
    }
    
    tasks.append(new_task)
    next_id += 1
    
    return jsonify(new_task), 201

# Delete a task
@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    tasks = [t for t in tasks if t["id"] != task_id]
    return jsonify({"message": "Task deleted"}), 200

# Update task (for pomodoro count)
@app.route("/api/tasks/<int:task_id>/pomodoro", methods=["POST"])
def increment_pomodoro(task_id):
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    task["pomodoroCount"] += 1
    return jsonify(task), 200

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)
