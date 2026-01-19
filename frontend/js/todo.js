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
     * Delete a task with confirmation
     */
    static async deleteTask(windowElement, taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await API.deleteTask(taskId);
                await Todo.loadTasks(windowElement);
                // Notify other windows that tasks have changed
                window.dispatchEvent(new CustomEvent('tasksUpdated'));
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    }

    /**
     * Toggle task completion
     */
    static async toggleTaskCompletion(windowElement, taskId) {
        // Note: Backend doesn't have update endpoint yet, so we'll skip this for now
        // This would require a PUT endpoint on the backend
        console.log('Toggle completion not yet implemented - requires backend update endpoint');
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

        // Task checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed || false;
        checkbox.addEventListener('change', () => Todo.toggleTaskCompletion(windowElement, task.id));

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

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => Todo.deleteTask(windowElement, task.id));

        // Assemble task item
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(infoDiv);
        li.appendChild(deleteBtn);

        return li;
    }
}
