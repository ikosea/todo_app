/**
 * Offline Support Module
 * Handles offline data storage and sync
 */

import { CONFIG } from './config.js';
import { API } from './api.js';

export class OfflineManager {
    static DB_NAME = 'ProductivityAppDB';
    static DB_VERSION = 1;
    static STORES = {
        TASKS: 'tasks',
        SESSIONS: 'sessions',
        PENDING: 'pending'
    };

    static db = null;

    /**
     * Initialize IndexedDB
     */
    static async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains(this.STORES.TASKS)) {
                    db.createObjectStore(this.STORES.TASKS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(this.STORES.SESSIONS)) {
                    db.createObjectStore(this.STORES.SESSIONS, { keyPath: 'date' });
                }
                if (!db.objectStoreNames.contains(this.STORES.PENDING)) {
                    db.createObjectStore(this.STORES.PENDING, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    /**
     * Check if online
     */
    static isOnline() {
        return navigator.onLine;
    }

    /**
     * Save task to IndexedDB
     */
    static async saveTask(task) {
        if (!this.db) await this.init();
        const transaction = this.db.transaction([this.STORES.TASKS], 'readwrite');
        const store = transaction.objectStore(this.STORES.TASKS);
        return store.put(task);
    }

    /**
     * Get all tasks from IndexedDB
     */
    static async getTasks() {
        if (!this.db) await this.init();
        const transaction = this.db.transaction([this.STORES.TASKS], 'readonly');
        const store = transaction.objectStore(this.STORES.TASKS);
        return store.getAll();
    }

    /**
     * Save session to IndexedDB
     */
    static async saveSession(session) {
        if (!this.db) await this.init();
        const transaction = this.db.transaction([this.STORES.SESSIONS], 'readwrite');
        const store = transaction.objectStore(this.STORES.SESSIONS);
        return store.put(session);
    }

    /**
     * Get all sessions from IndexedDB
     */
    static async getSessions() {
        if (!this.db) await this.init();
        const transaction = this.db.transaction([this.STORES.SESSIONS], 'readonly');
        const store = transaction.objectStore(this.STORES.SESSIONS);
        return store.getAll();
    }

    /**
     * Queue operation for sync when online
     */
    static async queueOperation(operation) {
        if (!this.db) await this.init();
        const transaction = this.db.transaction([this.STORES.PENDING], 'readwrite');
        const store = transaction.objectStore(this.STORES.PENDING);
        return store.add({
            operation: operation.type,
            data: operation.data,
            timestamp: Date.now()
        });
    }

    /**
     * Sync pending operations when back online
     */
    static async syncPending() {
        if (!this.isOnline() || !this.db) return;

        const transaction = this.db.transaction([this.STORES.PENDING], 'readwrite');
        const store = transaction.objectStore(this.STORES.PENDING);
        const pending = await store.getAll();

        for (const item of pending) {
            try {
                switch (item.operation) {
                    case 'addTask':
                        await API.addTask(item.data.text || item.data.name);
                        break;
                    case 'deleteTask':
                        await API.deleteTask(item.data.id || item.data.taskId);
                        break;
                    case 'incrementPomodoro':
                        await API.incrementPomodoro(item.data.taskId || item.data.id);
                        break;
                }
                // Remove from pending if successful
                store.delete(item.id);
            } catch (error) {
                console.error('Sync failed for operation:', item, error);
            }
        }
    }

    /**
     * Setup online/offline listeners
     */
    static setupListeners() {
        window.addEventListener('online', () => {
            console.log('Back online, syncing...');
            this.syncPending();
            // Dispatch event to refresh UI
            window.dispatchEvent(new CustomEvent('onlineStatusChanged', { detail: { online: true } }));
        });

        window.addEventListener('offline', () => {
            console.log('Gone offline');
            window.dispatchEvent(new CustomEvent('onlineStatusChanged', { detail: { online: false } }));
        });
    }
}

