/**
 * Todo Page - Simple standalone version
 * Handles task creation and management only
 */

// Task state
let tasks = [];

/**
 * Initialize the page
 */
function init() {
    loadTasks();
    setupEventListeners();
    renderTasks();
}

/**
 * Load tasks from localStorage
 */
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    tasks = saved ? JSON.parse(saved) : [];
    
    // Ensure each task has required properties
    tasks = tasks.map(task => ({
        id: task.id || Date.now() + Math.random(),
        text: task.text || '',
        completed: task.completed || false,
        createdAt: task.createdAt || new Date().toISOString(),
        pomodoroCount: task.pomodoroCount || 0
    }));
    
    saveTasks();
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add task button
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    
    // Enter key on input
    document.getElementById('task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

/**
 * Add a new task
 */
function addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    
    // Prevent empty task submission
    if (!text) {
        alert('Please enter a task name!');
        return;
    }
    
    // Create new task
    const newTask = {
        id: Date.now() + Math.random(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        pomodoroCount: 0
    };
    
    tasks.push(newTask);
    saveTasks();
    
    // Clear input
    input.value = '';
    
    // Re-render tasks
    renderTasks();
}

/**
 * Delete a task with confirmation
 */
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

/**
 * Toggle task completion
 */
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

/**
 * Render tasks to the DOM
 */
function renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Separate completed and active tasks
    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);
    
    // Render active tasks first
    activeTasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });
    
    // Render completed tasks at the bottom
    completedTasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskItem.classList.add('completed');
        taskList.appendChild(taskItem);
    });
}

/**
 * Create a task element
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    
    // Task checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    
    // Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    
    // Task info (date and pomodoro count)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'task-date';
    const date = new Date(task.createdAt);
    dateSpan.textContent = date.toLocaleDateString();
    
    const pomodoroSpan = document.createElement('span');
    pomodoroSpan.className = 'task-pomodoros';
    pomodoroSpan.textContent = `🍅 ${task.pomodoroCount || 0}`;
    
    infoDiv.appendChild(dateSpan);
    infoDiv.appendChild(pomodoroSpan);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Assemble task item
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);
    
    return li;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

