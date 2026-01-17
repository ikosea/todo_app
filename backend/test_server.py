"""
Quick test script to verify the server is responding
Run this in a separate terminal while app.py is running
"""

import requests

try:
    # Try to connect to the server
    response = requests.get("http://localhost:5000/")
    print("✅ Server is responding!")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to server")
    print("Make sure app.py is running in another terminal")
except Exception as e:
    print(f"❌ Error: {e}")

