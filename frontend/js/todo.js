/**
 * Todo Module - Task management
 * Handles task CRUD operations via backend API
 */

import { API } from './api.js';
import { CONFIG } from './config.js';

export class Todo {
    /**
     * Initialize Todo app in a window
     * @param {HTMLElement} windowElement - The window element
     */
    static async init(windowElement) {
        await Todo.loadTasks(windowElement);
        Todo.setupEventListeners(windowElement);
        Todo.setupNavigationLinks(windowElement);
        // Listen for task updates from other windows
        window.addEventListener('tasksUpdated', () => {
            Todo.loadTasks(windowElement);
        });
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners(windowElement) {
        const addBtn = windowElement.querySelector('#add-task-btn');
        const input = windowElement.querySelector('#task-input');

        if (addBtn) {
            // Use arrow function to preserve 'this' context
            addBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add task button clicked'); // Debug log
                await Todo.addTask(windowElement);
            });
        } else {
            console.error('Add task button not found in window element');
        }

        if (input) {
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await Todo.addTask(windowElement);
                }
            });
        } else {
            console.error('Task input not found in window element');
        }
    }

    /**
     * Setup navigation links to open other apps
     */
    static setupNavigationLinks(windowElement) {
        const navLinks = windowElement.querySelectorAll('[data-open-app]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const appType = link.getAttribute('data-open-app');
                if (appType) {
                    window.dispatchEvent(new CustomEvent('openApp', { 
                        detail: { appType } 
                    }));
                }
            });
        });
    }

    /**
     * Load tasks from backend
     */
    static async loadTasks(windowElement) {
        try {
            const tasks = await API.getTasks();
            Todo.renderTasks(windowElement, tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            Todo.renderTasks(windowElement, []);
        }
    }

    /**
     * Add a new task
     */
    static async addTask(windowElement) {
        const input = windowElement.querySelector('#task-input');
        if (!input) {
            console.error('Task input not found');
            return;
        }
        
        const text = input.value.trim();

        // Prevent empty task submission
        if (!text) {
            alert('Please enter a task name!');
            return;
        }

        try {
            console.log('Adding task:', text); // Debug log
            const newTask = await API.addTask(text);
            console.log('Task added:', newTask); // Debug log
            if (newTask) {
                input.value = '';
                await Todo.loadTasks(windowElement);
                // Notify other windows that tasks have changed
                window.dispatchEvent(new CustomEvent('tasksUpdated'));
            } else {
                alert('Failed to add task. Please try again.');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    }

    /**
     * Move a task to trash
     */
    static async deleteTask(windowElement, taskId) {
        if (confirm('Move this task to trash?')) {
            try {
                // Get the task first
                const tasks = await API.getTasks();
                const task = tasks.find(t => t.id === taskId);
                
                if (task) {
                    // Add to trash in localStorage
                    const trash = Todo.getTrash();
                    trash.push({
                        ...task,
                        deletedAt: new Date().toISOString()
                    });
                    localStorage.setItem('trash', JSON.stringify(trash));
                    
                    // Delete from backend
                    await API.deleteTask(taskId);
                    await Todo.loadTasks(windowElement);
                    // Notify other windows that tasks have changed
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                    window.dispatchEvent(new CustomEvent('trashUpdated'));
                }
            } catch (error) {
                console.error('Error moving task to trash:', error);
                alert('Failed to move task to trash. Please try again.');
            }
        }
    }

    /**
     * Get trash items from localStorage
     */
    static getTrash() {
        const trashStr = localStorage.getItem('trash');
        return trashStr ? JSON.parse(trashStr) : [];
    }

    /**
     * Render tasks to the DOM
     */
    static renderTasks(windowElement, tasks) {
        const taskList = windowElement.querySelector('#task-list');
        const emptyState = windowElement.querySelector('#empty-state');

        if (!taskList) return;

        // Clear existing tasks
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Separate completed and active tasks
        const activeTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        // Render active tasks first
        activeTasks.forEach(task => {
            const taskItem = Todo.createTaskElement(windowElement, task);
            taskList.appendChild(taskItem);
        });

        // Render completed tasks at the bottom
        completedTasks.forEach(task => {
            const taskItem = Todo.createTaskElement(windowElement, task);
            taskItem.classList.add('completed');
            taskList.appendChild(taskItem);
        });
    }

    /**
     * Create a task element
     */
    static createTaskElement(windowElement, task) {
        const li = document.createElement('li');
        li.className = 'task-item';

        // Task text
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        // Task info (date and pomodoro count)
        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-info';

        const pomodoroSpan = document.createElement('span');
        pomodoroSpan.className = 'task-pomodoros';
        pomodoroSpan.textContent = `🍅 ${task.pomodoroCount || 0}`;

        infoDiv.appendChild(pomodoroSpan);

        // Delete button (moves to trash)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn mac-button';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => Todo.deleteTask(windowElement, task.id));

        // Assemble task item
        li.appendChild(textSpan);
        li.appendChild(infoDiv);
        li.appendChild(deleteBtn);

        return li;
    }
}
