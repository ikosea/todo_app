from flask import Flask, jsonify
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)

# Enable CORS for frontend connection
CORS(app)

# Home route - returns JSON message
@app.route("/")
def hello():
    return jsonify({"message": "Backend is running"})

# Start server
if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)

