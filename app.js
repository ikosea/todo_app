// === DOM Elements ===
const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const sessionTypeDisplay = document.getElementById("session-type");
const timerSection = document.querySelector('.timer-section');

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const skipBtn = document.getElementById("skip-btn");

const workInput = document.getElementById("work-duration");
const shortBreakInput = document.getElementById("short-break");
const longBreakInput = document.getElementById("long-break");
const autoStartBreaks = document.getElementById("auto-start-breaks");
const soundNotifications = document.getElementById("sound-notifications");

const completedPomodorosDisplay = document.getElementById("completed-pomodoros");
const totalFocusTimeDisplay = document.getElementById("total-focus-time");
const completedTasksDisplay = document.getElementById("completed-tasks");
const currentStreakDisplay = document.getElementById("current-streak");

const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

const fullscreenBtn = document.getElementById('fullscreen-btn');
const themeToggle = document.getElementById('theme-toggle');

const notification = document.getElementById("notification");

// (progress tiles removed)

// === Timer Variables ===
let timerSeconds = workInput.value * 60;
let timerInterval = null;
let isRunning = false;
let currentSession = "work"; // work, short, long
let pomodoroCount = 0;

// === Stats Data ===
let stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {
    completedPomodoros: 0,
    totalFocusTime: 0,
    completedTasks: 0,
    currentStreak: 0,
    lastActiveDate: null
};

// === Load Stats ===
function loadStats() {
    completedPomodorosDisplay.textContent = stats.completedPomodoros;
    totalFocusTimeDisplay.textContent = stats.totalFocusTime;
    completedTasksDisplay.textContent = stats.completedTasks;
    currentStreakDisplay.textContent = stats.currentStreak;
}
loadStats();

// === Save Stats ===
function saveStats() {
    localStorage.setItem("pomodoroStats", JSON.stringify(stats));
}

// === Update Timer Display ===
function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// === Update Progress Bar ===
function updateProgress() {
    let totalDuration = getSessionDuration(currentSession) * 60;
    if (!totalDuration || totalDuration <= 0) {
        progressBar.style.width = `0%`;
        return;
    }
    let percent = ((totalDuration - timerSeconds) / totalDuration) * 100;
    percent = Math.max(0, Math.min(100, percent));
    progressBar.style.width = `${percent}%`;
}

// === Get Session Duration ===
function getSessionDuration(type) {
    if (type === "work") return parseInt(workInput.value);
    if (type === "short") return parseInt(shortBreakInput.value);
    if (type === "long") return parseInt(longBreakInput.value);
}

// === Start Timer ===
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.style.display = "none";
        pauseBtn.style.display = "inline-block";

        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            updateProgress();

            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                handleSessionEnd();
            }
        }, 1000);
    }
}

// === Pause Timer ===
function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
}

// === Reset Timer ===
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timerSeconds = getSessionDuration(currentSession) * 60;
    updateTimerDisplay();
    updateProgress();
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
}

// === Skip Session ===
function skipSession() {
    clearInterval(timerInterval);
    isRunning = false;
    handleSessionEnd(true);
}

// === Handle Session End ===
function handleSessionEnd(skipped = false) {
    if (currentSession === "work" && !skipped) {
        stats.completedPomodoros++;
        stats.totalFocusTime += getSessionDuration("work");
        updateStreak();
        saveStats();
        loadStats();
    }

    if (soundNotifications.checked) {
        playSound();
    }

    if (currentSession === "work") {
        pomodoroCount++;
        currentSession = (pomodoroCount % 4 === 0) ? "long" : "short";
    } else {
        currentSession = "work";
    }

    sessionTypeDisplay.textContent =
        currentSession === "work" ? "Work Session" :
        currentSession === "short" ? "Short Break" : "Long Break";

    timerSeconds = getSessionDuration(currentSession) * 60;
    updateTimerDisplay();
    updateProgress();

    if (autoStartBreaks.checked || currentSession === "work") {
        startTimer();
    } else {
        startBtn.style.display = "inline-block";
        pauseBtn.style.display = "none";
    }
}

// === Play Sound Notification ===
function playSound() {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.play();
}

// === Update Streak ===
function updateStreak() {
    const today = new Date().toDateString();
    if (stats.lastActiveDate === today) return;
    if (stats.lastActiveDate === new Date(Date.now() - 86400000).toDateString()) {
        stats.currentStreak++;
    } else {
        stats.currentStreak = 1;
    }
    stats.lastActiveDate = today;
}

// === Tasks ===
let tasks = JSON.parse(localStorage.getItem("pomodoroTasks")) || [];

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${task}
            <button onclick="removeTask(${index})">❌</button>
        `;
        taskList.appendChild(li);
    });
}
function addTask() {
    if (taskInput.value.trim() !== "") {
        tasks.push(taskInput.value.trim());
        localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
        taskInput.value = "";
        renderTasks();
    }
}
function removeTask(index) {
    tasks.splice(index, 1);
    stats.completedTasks++;
    saveStats();
    loadStats();
    localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
    renderTasks();
}
renderTasks();

// === Event Listeners ===
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
skipBtn.addEventListener("click", skipSession);
addTaskBtn.addEventListener("click", addTask);

// Fullscreen toggle for the pomodoro timer
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            timerSection.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
        } else {
            document.exitFullscreen();
        }
    });

    // Optional: when exiting fullscreen, ensure controls are visible
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            startBtn.style.display = isRunning ? 'none' : 'inline-block';
            pauseBtn.style.display = isRunning ? 'inline-block' : 'none';
        }
    });
}

// === Init ===
updateTimerDisplay();
updateProgress();

// === Theme Toggle ===
// Load theme preference from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});