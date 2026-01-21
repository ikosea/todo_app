/**
 * Meditation Module - Breathing exercises and mindfulness
 * - Box Breathing (4-4-4-4)
 * - 4-7-8 Breathing
 * - Deep Breathing
 * - Guided meditation timer
 */

import { CONFIG } from './config.js';
import { formatTime } from './utils.js';

const BREATHING_TYPES = {
    box: { name: 'Box Breathing', pattern: [4, 4, 4, 4], labels: ['Inhale', 'Hold', 'Exhale', 'Hold'] },
    '4-7-8': { name: '4-7-8 Breathing', pattern: [4, 7, 8, 0], labels: ['Inhale', 'Hold', 'Exhale', 'Rest'] },
    deep: { name: 'Deep Breathing', pattern: [6, 0, 6, 0], labels: ['Inhale', '', 'Exhale', ''] },
    equal: { name: 'Equal Breathing', pattern: [4, 0, 4, 0], labels: ['Inhale', '', 'Exhale', ''] }
};

export class Meditation {
    constructor(windowElement) {
        this.windowElement = windowElement;
        this.currentType = 'box';
        this.isRunning = false;
        this.currentPhase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold/rest
        this.secondsRemaining = 0;
        this.intervalId = null;
        this.cycleCount = 0;
    }

    /**
     * Initialize Meditation app
     */
    static async init(windowElement) {
        const meditation = new Meditation(windowElement);
        meditation.setupEventListeners();
        meditation.updateUI();
        return meditation;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const typeSelect = this.windowElement.querySelector('#meditation-type');
        const startBtn = this.windowElement.querySelector('#meditation-start');
        const pauseBtn = this.windowElement.querySelector('#meditation-pause');
        const resetBtn = this.windowElement.querySelector('#meditation-reset');
        const cycleDisplay = this.windowElement.querySelector('#cycle-count');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                if (!this.isRunning) {
                    this.currentType = e.target.value;
                    this.reset();
                }
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }

    /**
     * Start breathing exercise
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const pattern = BREATHING_TYPES[this.currentType].pattern;
        this.currentPhase = 0;
        this.secondsRemaining = pattern[0];
        this.updateUI();
        this.tick();
    }

    /**
     * Pause breathing exercise
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.updateUI();
    }

    /**
     * Reset breathing exercise
     */
    reset() {
        this.pause();
        this.currentPhase = 0;
        this.cycleCount = 0;
        const pattern = BREATHING_TYPES[this.currentType].pattern;
        this.secondsRemaining = pattern[0];
        this.updateUI();
    }

    /**
     * Timer tick
     */
    tick() {
        if (!this.isRunning) return;

        const pattern = BREATHING_TYPES[this.currentType].pattern;
        const labels = BREATHING_TYPES[this.currentType].labels;

        // Update display
        this.updateDisplay();

        // Countdown
        this.secondsRemaining--;

        if (this.secondsRemaining <= 0) {
            // Move to next phase
            this.currentPhase = (this.currentPhase + 1) % 4;
            
            // Skip phases with 0 duration
            while (pattern[this.currentPhase] === 0 && this.isRunning) {
                this.currentPhase = (this.currentPhase + 1) % 4;
            }

            if (this.currentPhase === 0) {
                // Completed one full cycle
                this.cycleCount++;
            }

            if (this.isRunning) {
                this.secondsRemaining = pattern[this.currentPhase];
            }
        }

        if (this.isRunning) {
            this.intervalId = setTimeout(() => this.tick(), 1000);
        }
    }

    /**
     * Update display
     */
    updateDisplay() {
        const pattern = BREATHING_TYPES[this.currentType].pattern;
        const labels = BREATHING_TYPES[this.currentType].labels;
        const label = labels[this.currentPhase] || '';
        const totalSeconds = pattern[this.currentPhase];

        // Update instruction text
        const instructionEl = this.windowElement.querySelector('#breathing-instruction');
        if (instructionEl) {
            instructionEl.textContent = label || 'Rest';
        }

        // Update timer display
        const timerEl = this.windowElement.querySelector('#breathing-timer');
        if (timerEl) {
            timerEl.textContent = this.secondsRemaining.toString();
        }

        // Update progress circle (visual indicator)
        const progressEl = this.windowElement.querySelector('#breathing-progress');
        if (progressEl && totalSeconds > 0) {
            const progress = (totalSeconds - this.secondsRemaining) / totalSeconds;
            const circumference = 2 * Math.PI * 45; // radius = 45
            const offset = circumference * (1 - progress);
            progressEl.style.strokeDashoffset = offset;
        }

        // Update cycle count
        const cycleEl = this.windowElement.querySelector('#cycle-count');
        if (cycleEl) {
            cycleEl.textContent = `Cycles: ${this.cycleCount}`;
        }
    }

    /**
     * Update UI state
     */
    updateUI() {
        const startBtn = this.windowElement.querySelector('#meditation-start');
        const pauseBtn = this.windowElement.querySelector('#meditation-pause');
        const typeSelect = this.windowElement.querySelector('#meditation-type');

        if (startBtn) {
            startBtn.style.display = this.isRunning ? 'none' : 'inline-block';
        }
        if (pauseBtn) {
            pauseBtn.style.display = this.isRunning ? 'inline-block' : 'none';
        }
        if (typeSelect) {
            typeSelect.disabled = this.isRunning;
        }

        if (!this.isRunning) {
            this.updateDisplay();
        }
    }
}

