/**
 * Tutorial Module - First-time user guide
 * Provides interactive tutorial for new users
 */

export class Tutorial {
    /**
     * Initialize Tutorial app
     * @param {HTMLElement} windowElement - The window element
     */
    static init(windowElement) {
        this.currentStep = 0;
        this.windowElement = windowElement;
        this.setupEventListeners();
        this.showStep(0);
        
        // Mark tutorial as viewed (per user if available)
        const userKey = this.getUserKey();
        localStorage.setItem(userKey, 'true');
    }

    static getUserKey() {
        try {
            const raw = localStorage.getItem('currentUser');
            const user = raw ? JSON.parse(raw) : null;
            const username = user?.username || 'guest';
            return `tutorialViewed:${username}`;
        } catch {
            return 'tutorialViewed:guest';
        }
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners() {
        const nextBtn = this.windowElement.querySelector('#tutorial-next');
        const prevBtn = this.windowElement.querySelector('#tutorial-prev');
        const skipBtn = this.windowElement.querySelector('#tutorial-skip');
        const closeBtn = this.windowElement.querySelector('#tutorial-close');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.closeTutorial());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeTutorial());
        }
    }

    /**
     * Show a specific tutorial step
     */
    static showStep(stepIndex) {
        const steps = this.getTutorialSteps();
        if (stepIndex < 0 || stepIndex >= steps.length) return;

        this.currentStep = stepIndex;
        const step = steps[stepIndex];
        const contentEl = this.windowElement.querySelector('#tutorial-content');
        const titleEl = this.windowElement.querySelector('#tutorial-title');
        const stepIndicatorEl = this.windowElement.querySelector('#tutorial-step-indicator');
        const prevBtn = this.windowElement.querySelector('#tutorial-prev');
        const nextBtn = this.windowElement.querySelector('#tutorial-next');
        const skipBtn = this.windowElement.querySelector('#tutorial-skip');

        if (titleEl) titleEl.textContent = step.title;
        if (contentEl) contentEl.innerHTML = step.content;
        if (stepIndicatorEl) {
            stepIndicatorEl.textContent = `Step ${stepIndex + 1} of ${steps.length}`;
        }

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = stepIndex === 0;
            prevBtn.style.opacity = stepIndex === 0 ? '0.5' : '1';
        }
        if (nextBtn) {
            nextBtn.textContent = stepIndex === steps.length - 1 ? 'Finish' : 'Next';
        }
        if (skipBtn && stepIndex === steps.length - 1) {
            skipBtn.style.display = 'none';
        } else if (skipBtn) {
            skipBtn.style.display = 'inline-block';
        }
    }

    /**
     * Go to next step
     */
    static nextStep() {
        const steps = this.getTutorialSteps();
        if (this.currentStep < steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.closeTutorial();
        }
    }

    /**
     * Go to previous step
     */
    static prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Close tutorial
     */
    static closeTutorial() {
        // Dispatch event to close window
        const windowId = this.windowElement.id;
        if (windowId) {
            window.dispatchEvent(new CustomEvent('closeWindow', { 
                detail: { windowId } 
            }));
        }
    }

    /**
     * Get tutorial steps
     */
    static getTutorialSteps() {
        return [
            {
                title: 'Welcome to Productivity App!',
                content: `
                    <div style="text-align: center; padding: 20px 0;">
                        <p style="margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                            Welcome! This is a retro-style productivity app inspired by classic Macintosh.
                        </p>
                        <p style="margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                            You can drag icons around the desktop, open apps by clicking them, and manage your tasks with the Pomodoro technique.
                        </p>
                        <p style="font-size: 13px; line-height: 1.6; color: #808080;">
                            Let's get started!
                        </p>
                    </div>
                `
            },
            {
                title: 'Desktop Icons',
                content: `
                    <div style="padding: 20px 0;">
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>📱 Dragging Icons:</strong> Click and hold any desktop icon, then drag it to move it around. Release to drop it in a new position.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>🖱️ Clicking Icons:</strong> Single-click an icon to open its app window.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>📂 Available Apps:</strong>
                        </p>
                        <ul style="margin-left: 20px; font-size: 12px; line-height: 1.8;">
                            <li><strong>Pomodoro Timer:</strong> Focus sessions with breaks</li>
                            <li><strong>Tasks:</strong> Manage your to-do list</li>
                            <li><strong>Dashboard:</strong> View your productivity stats</li>
                            <li><strong>Folder:</strong> Categorized task lists</li>
                            <li><strong>Ambient:</strong> Background sounds for focus</li>
                            <li><strong>Meditation:</strong> Breathing exercises</li>
                        </ul>
                    </div>
                `
            },
            {
                title: 'Pomodoro Timer',
                content: `
                    <div style="padding: 20px 0;">
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            The <strong>Pomodoro Technique</strong> helps you focus by breaking work into 25-minute sessions.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>How to use:</strong>
                        </p>
                        <ol style="margin-left: 20px; font-size: 12px; line-height: 1.8;">
                            <li>Select a task from the dropdown (or add a new one)</li>
                            <li>Click "Start" to begin a 25-minute focus session</li>
                            <li>Take a 5-minute break when the timer ends</li>
                            <li>After 4 pomodoros, take a longer 15-minute break</li>
                        </ol>
                        <p style="margin-top: 16px; font-size: 12px; color: #808080;">
                            Your progress is tracked automatically in the Dashboard!
                        </p>
                    </div>
                `
            },
            {
                title: 'Task Management',
                content: `
                    <div style="padding: 20px 0;">
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>Adding Tasks:</strong> Type in the input field and click "Add Task" or press Enter.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>Completing Tasks:</strong> Click the checkbox next to a task to mark it complete.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>Deleting Tasks:</strong> Click the trash icon to move a task to the Trash folder.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>Folder App:</strong> Organize tasks by urgency (Urgent, Important, Not Important).
                        </p>
                        <p style="margin-top: 16px; font-size: 12px; color: #808080;">
                            Tasks are saved to your account and sync across devices!
                        </p>
                    </div>
                `
            },
            {
                title: 'Dashboard & Stats',
                content: `
                    <div style="padding: 20px 0;">
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            The <strong>Dashboard</strong> shows your productivity statistics:
                        </p>
                        <ul style="margin-left: 20px; font-size: 12px; line-height: 1.8;">
                            <li>Total Pomodoros completed</li>
                            <li>Total focus time and break time</li>
                            <li>Tasks completed</li>
                            <li>Focus streak calendar (GitHub-style)</li>
                            <li>Session history</li>
                            <li>Daily summary</li>
                        </ul>
                        <p style="margin-top: 16px; font-size: 12px; color: #808080;">
                            Use the year dropdown to view stats from different years!
                        </p>
                    </div>
                `
            },
            {
                title: 'Additional Features',
                content: `
                    <div style="padding: 20px 0;">
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>🌊 Ambient Noise:</strong> Play background sounds (white noise, rain, coffee shop, waves) to help you focus.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>🧘 Meditation:</strong> Practice breathing exercises (Box Breathing, 4-7-8, etc.) for relaxation.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>💾 Data Export/Import:</strong> Go to File → Export Data or Import Data to backup/restore your data.
                        </p>
                        <p style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
                            <strong>📴 Offline Support:</strong> The app works offline! Your changes sync when you're back online.
                        </p>
                        <p style="margin-top: 16px; font-size: 12px; color: #808080;">
                            You can always reopen this tutorial by clicking the question mark icon!
                        </p>
                    </div>
                `
            },
            {
                title: 'You\'re All Set!',
                content: `
                    <div style="text-align: center; padding: 20px 0;">
                        <p style="margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                            🎉 You're ready to start being productive!
                        </p>
                        <p style="margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
                            Try opening the Pomodoro Timer and starting your first focus session.
                        </p>
                        <p style="font-size: 12px; color: #808080;">
                            Remember: You can always reopen this tutorial from the question mark icon on the desktop.
                        </p>
                    </div>
                `
            }
        ];
    }
}

