# Testing Guide - Authentication System

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   python app.py
   ```
   Should see: `Running on http://127.0.0.1:5000`

3. **Start Frontend Server** (in separate terminal)
   ```bash
   python -m http.server 8000
   ```

## Testing Steps

### Step 1: Test User Registration

**Option A: Using Browser Console**

1. Open: `http://localhost:8000/auth.html`
2. Open browser console (F12)
3. Switch to "Sign Up" tab
4. Fill in form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
5. Click "Sign Up"
6. Should see success message and switch to Sign In form

**Option B: Using Browser Console (Direct API)**

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: "testuser",
    email: "test@example.com",
    password: "password123"
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Step 2: Test User Login

**Option A: Using Auth Page**

1. Go to: `http://localhost:8000/auth.html`
2. Make sure "Sign In" tab is active
3. Enter credentials:
   - Username: `testuser` (or email: `test@example.com`)
   - Password: `password123`
4. Click "Sign In"
5. Should redirect to `todo.html`

**Option B: Using Browser Console**

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: "testuser",
    password: "password123"
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  // Store token
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    console.log('Token stored!');
  }
});
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Step 3: Verify Token Storage

**In Browser Console:**
```javascript
// Check if token is stored
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', JSON.parse(localStorage.getItem('currentUser')));
```

Should show:
- Token: Long JWT string
- User: User object with id, username, email

### Step 4: Test Protected API Calls

**Test with Token:**
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:5000/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Tasks:', data));
```

### Step 5: Test Full Flow

1. **Register New User**
   - Go to `http://localhost:8000/auth.html`
   - Click "Sign Up" tab
   - Fill form and submit
   - Should see success message

2. **Login**
   - Click "Sign In" tab (or use menu: Auth → Sign In)
   - Enter credentials
   - Click "Sign In"
   - Should redirect to `todo.html`

3. **Verify Token in Todo Page**
   - Open browser console on todo page
   - Run: `localStorage.getItem('authToken')`
   - Should see JWT token

4. **Add Task (with authentication)**
   - Add a task on todo page
   - Check network tab in DevTools
   - Request should include `Authorization: Bearer <token>` header

## Testing Error Cases

### Test Invalid Login

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: "wronguser",
    password: "wrongpass"
  })
})
.then(r => r.json())
.then(data => console.log('Error:', data));
```

**Expected:** `{"error": "Invalid username or password"}` with status 401

### Test Duplicate Registration

```javascript
// Try to register same username twice
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: "testuser",  // Already exists
    email: "new@example.com",
    password: "password123"
  })
})
.then(r => r.json())
.then(data => console.log('Error:', data));
```

**Expected:** `{"error": "Username already exists"}` with status 400

### Test Short Password

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: "newuser",
    email: "new@example.com",
    password: "123"  // Too short
  })
})
.then(r => r.json())
.then(data => console.log('Error:', data));
```

**Expected:** `{"error": "Password must be at least 6 characters"}` with status 400

## Quick Test Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 8000
- [ ] Can register new user
- [ ] Can login with username
- [ ] Can login with email
- [ ] Token is stored in localStorage
- [ ] Redirects to todo.html after login
- [ ] Invalid credentials show error
- [ ] Duplicate registration shows error
- [ ] Short password shows error

## Troubleshooting

### "Connection error"
- Check backend is running: `http://localhost:5000/`
- Should see: `{"message": "Backend is running"}`

### "Module not found: jwt"
- Run: `pip install PyJWT==2.8.0`

### Token not stored
- Check browser console for errors
- Verify login response includes `token` field
- Check localStorage is enabled (not private/incognito)

### CORS errors
- Make sure using `http://localhost:8000` not `file://`
- Verify `flask-cors` is installed

