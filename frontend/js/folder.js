/**
 * Folder Module - Categorized quick to-do lists (local only)
 * Columns:
 * - Urgent
 * - Important
 * - Not Important
 *
 * Stored in localStorage so it's instant and doesn't require backend schema changes.
 */

import { CONFIG } from './config.js';

const STORAGE_KEY = 'folderLists';

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { urgent: [], important: [], notImportant: [] };
        const parsed = JSON.parse(raw);
        return {
            urgent: Array.isArray(parsed.urgent) ? parsed.urgent : [],
            important: Array.isArray(parsed.important) ? parsed.important : [],
            notImportant: Array.isArray(parsed.notImportant) ? parsed.notImportant : []
        };
    } catch {
        return { urgent: [], important: [], notImportant: [] };
    }
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(s) {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export class Folder {
    static async init(windowElement) {
        if (!windowElement) return;

        // Default size
        try {
            windowElement.style.width = '640px';
            windowElement.style.height = '420px';
        } catch {
            // ignore
        }

        this.state = loadState();
        this.render(windowElement);
        this.attach(windowElement);
    }

    static render(windowElement) {
        const columns = [
            { key: 'urgent', title: 'Urgent' },
            { key: 'important', title: 'Important' },
            { key: 'notImportant', title: 'Not Important' }
        ];

        const makeItems = (key) => {
            const items = this.state[key] || [];
            if (!items.length) {
                return `<div class="empty-state" style="display:block; margin: 8px 0;"><p>No items</p></div>`;
            }
            return `
                <ul class="task-list" style="margin: 0;">
                    ${items.map((t, idx) => `
                        <li class="task-item" style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <span style="flex:1; word-break: break-word;">${esc(t)}</span>
                            <button class="mac-button" data-folder-remove="${key}:${idx}" style="padding: 2px 8px;">Remove</button>
                        </li>
                    `).join('')}
                </ul>
            `;
        };

        const content = windowElement.querySelector('.mac-content');
        if (!content) return;

        content.innerHTML = `
            <div class="mac-content">
                <nav class="page-nav">
                    <a href="#" class="nav-link" data-open-app="todo">Tasks</a>
                    <span class="nav-separator">|</span>
                    <a href="#" class="nav-link" data-open-app="pomodoro">Pomodoro Timer</a>
                </nav>

                <h2 class="section-title" style="margin-top: 8px;">Folder</h2>
                <div style="font-family:'Geneva', monospace; font-size: 12px; color:#808080; margin-bottom: 10px;">
                    Quick categorized to-do lists (saved locally in this browser).
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    ${columns.map(col => `
                        <section class="mac-window" style="padding: 10px;">
                            <h3 class="section-title" style="margin: 0 0 8px 0; font-size: 14px;">${col.title}</h3>
                            <div style="display:flex; gap:6px; margin-bottom: 8px;">
                                <input class="mac-input" type="text" placeholder="Add..." data-folder-input="${col.key}" />
                                <button class="mac-button" data-folder-add="${col.key}">Add</button>
                            </div>
                            ${makeItems(col.key)}
                        </section>
                    `).join('')}
                </div>

                <div style="margin-top: 12px; display:flex; justify-content:flex-end; gap: 8px;">
                    <button class="mac-button mac-button-danger" id="folder-clear">Clear All</button>
                </div>
            </div>
        `;
    }

    static attach(windowElement) {
        // Navigation
        windowElement.querySelectorAll('[data-open-app]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const appType = link.getAttribute('data-open-app');
                if (appType) {
                    window.dispatchEvent(new CustomEvent('openApp', { detail: { appType } }));
                }
            });
        });

        // Add buttons
        windowElement.querySelectorAll('[data-folder-add]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = btn.getAttribute('data-folder-add');
                const input = windowElement.querySelector(`[data-folder-input="${key}"]`);
                if (!key || !input) return;
                const text = input.value.trim();
                if (!text) return;
                this.state[key] = this.state[key] || [];
                this.state[key].unshift(text);
                input.value = '';
                saveState(this.state);
                this.render(windowElement);
                this.attach(windowElement);
            });
        });

        // Enter-to-add
        windowElement.querySelectorAll('[data-folder-input]').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                const key = input.getAttribute('data-folder-input');
                const addBtn = windowElement.querySelector(`[data-folder-add="${key}"]`);
                addBtn?.click();
            });
        });

        // Remove buttons (delegated)
        windowElement.querySelectorAll('[data-folder-remove]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const raw = btn.getAttribute('data-folder-remove') || '';
                const [key, idxStr] = raw.split(':');
                const idx = parseInt(idxStr, 10);
                if (!key || Number.isNaN(idx)) return;
                this.state[key] = this.state[key] || [];
                this.state[key].splice(idx, 1);
                saveState(this.state);
                this.render(windowElement);
                this.attach(windowElement);
            });
        });

        const clearBtn = windowElement.querySelector('#folder-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!confirm('Clear all Folder items?')) return;
                this.state = { urgent: [], important: [], notImportant: [] };
                saveState(this.state);
                this.render(windowElement);
                this.attach(windowElement);
            });
        }
    }
}


