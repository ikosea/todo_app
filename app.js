let sessionHistory = JSON.parse(
  localStorage.getItem("pomodoroHistory")
) || [];

// === DOM Elements ===
const timerDisplay = document.getElementById("timer");
const sessionTypeDisplay = document.getElementById("session-type");
const progressBar = document.getElementById("progress-bar");
const timerSection = document.getElementById("timer-section");
const activeTaskText = document.getElementById("active-task-text");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const skipBtn = document.getElementById("skip-btn");

const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

const themeToggle = document.getElementById("theme-toggle");

// Timer constants
const WORK_DURATION = 25;
const SHORT_BREAK_DURATION = 5;
const LONG_BREAK_DURATION = 15;

// Timer state
let timerSeconds = WORK_DURATION * 60;
let timerInterval = null;
let isRunning = false;
let currentSession = "work";
let sessionsCompleted = 0;
let pomodoroCount = 0;

// Task state
let tasks = [];
let selectedTaskId = null;

// === Initialization ===
function init() {
    loadTasks();
    updateTimerDisplay();
    attachEventListeners();
    updateTimerBackground();
    loadTheme();
    resetPomodoroIndicator();
    updateStats();
}

function attachEventListeners() {
    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);
    skipBtn.addEventListener("click", skipSession);

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("task-delete-btn")) {
            const taskId = parseInt(e.target.getAttribute("data-id"));
            removeTask(taskId);
        }
    });

    themeToggle.addEventListener("click", toggleTheme);
}

// === Timer Functions ===
function startTimer() {
    if (isRunning) return;

    if (!selectedTaskId) {
        alert("Please select a task before starting the timer");
        return;
    }
    updateUIMode();

    isRunning = true;
    lockTasks();
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

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    unlockTasks();
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    document.body.classList.remove("focus-mode", "break-mode");
    focusHint.textContent = "";

}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    unlockTasks();
    timerSeconds = getSessionDuration(currentSession) * 60;
    updateTimerDisplay();
    updateProgress();
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    document.body.classList.remove("focus-mode", "break-mode");
    focusHint.textContent = "";

}

function skipSession() {
    clearInterval(timerInterval);
    isRunning = false;
    autoStartNextSession = false;
    handleSessionEnd();
}
function handleSessionEnd() {
    playNotificationSound();

    if (currentSession === "work") {
        pomodoroCount++;
        sessionsCompleted++;
        incrementTaskPomodoro(); // renamed
        updatePomodoroIndicator();
        currentSession = (sessionsCompleted % 4 === 0) ? "long" : "short";
    } else {
        currentSession = "work";
        if (sessionsCompleted % 4 === 0) resetPomodoroIndicator();
    }
    if (currentSession === "work") {
    recordSession();
    }

    unlockTasks();
    updateSessionLabel();

    timerSeconds = getSessionDuration(currentSession) * 60;
    updateTimerDisplay();
    updateProgress();
    updateUIMode();


    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";

    if (autoStartNextSession) startTimer();
    if (currentSession === "work") {
    enableFocusMode();
    } else {
    enableBreakMode();
    }

}


// === Helper Functions ===
function getSessionDuration(type) {
    if (type === "work") return WORK_DURATION;
    if (type === "short") return SHORT_BREAK_DURATION;
    if (type === "long") return LONG_BREAK_DURATION;
    return WORK_DURATION;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function updateProgress() {
    const duration = getSessionDuration(currentSession) * 60;
    const elapsed = duration - timerSeconds;
    const percent = (elapsed / duration) * 100;
    progressBar.style.width = Math.max(0, Math.min(100, percent)) + "%";
}

function updateSessionLabel() {
    sessionTypeDisplay.textContent =
        currentSession === "work" ? "Work Session" :
        currentSession === "short" ? "Short Break" :
        "Long Break";
}

function lockTasks() {
    document.querySelectorAll(".task-item").forEach(item => {
        if (!item.classList.contains("completed")) item.classList.add("disabled");
    });
}

function unlockTasks() {
    document.querySelectorAll(".task-item").forEach(item => {
        if (!item.classList.contains("completed")) item.classList.remove("disabled");
    });
}

function selectTask(taskId) {
    if (isRunning) return;
    selectedTaskId = taskId;

    document.querySelectorAll(".task-item").forEach(item => {
        item.classList.remove("selected");
        if (parseInt(item.getAttribute("data-id")) === taskId) item.classList.add("selected");
    });

    const task = tasks.find(t => t.id === taskId);
    activeTaskText.textContent = task ? task.text : "No task selected";
}

// === Tasks ===
function loadTasks() {
    const saved = localStorage.getItem("pomodoroTasks");
    tasks = saved ? JSON.parse(saved) : [];
    renderTasks();
}

function saveTasks() {
    localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const newTask = { id: Date.now(), text: taskText, completed: false, pomodoroCount: 0 };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
}

function removeTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    if (selectedTaskId === taskId) selectedTaskId = null;
    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";
    if (!tasks.length) {
        taskList.innerHTML = "<li class='empty-state'>No tasks yet. Add one to get started!</li>";
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item" + (task.completed ? " completed" : "");
        if (task.id === selectedTaskId) li.classList.add("selected");
        li.setAttribute("data-id", task.id);

        li.innerHTML = `
            <span>${escapeHtml(task.text)} ${task.pomodoroCount ? `(${task.pomodoroCount})` : ""}</span>
            <button class="task-delete-btn" data-id="${task.id}">❌</button>
        `;
        li.addEventListener("click", e => {
            if (!e.target.classList.contains("task-delete-btn")) selectTask(task.id);
        });
        taskList.appendChild(li);
    });
}

function incrementTaskPomodoro() {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
        task.pomodoroCount++;
        saveTasks();
        renderTasks();
    }
}


function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// === Pomodoro Indicator ===
function updatePomodoroIndicator() {
    const circleId = `circle-${pomodoroCount}`;
    const circle = document.getElementById(circleId);
    if (circle) circle.classList.add("filled");
}

function resetPomodoroIndicator() {
    for (let i = 1; i <= 4; i++) {
        const circle = document.getElementById(`circle-${i}`);
        if (circle) circle.classList.remove("filled");
    }
    pomodoroCount = 0;
}

// === Notification Sound ===
function playNotificationSound() {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.play();
}

// === Random Background ===
const workBackgrounds = [
    "url('assets/images/work1.jpg')",
    "url('assets/images/work2.jpg')",
    "url('assets/images/work3.jpg')"
];
const breakBackgrounds = [
    "url('assets/images/break1.jpg')",
    "url('assets/images/break2.jpg')",
    "url('assets/images/break3.jpg')"
];

function setRandomBackground() {
    const pool = currentSession === "work" ? workBackgrounds : breakBackgrounds;
    const randomImage = pool[Math.floor(Math.random() * pool.length)];
    timerSection.style.backgroundImage = randomImage;
    timerSection.style.backgroundSize = "cover";
    timerSection.style.backgroundPosition = "center";
}

// === Theme ===
function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") document.body.classList.add("dark-mode");
}

function toggleTheme() {
    const dark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", dark ? "dark" : "light");
}
function updateTimerBackground() {
    timerSection.classList.remove("work-mode", "break-mode");
    timerSection.classList.add(
        currentSession === "work" ? "work-mode" : "break-mode"
    );
}
    function recordSession() {
    const today = new Date().toISOString().slice(0, 10);

    sessionHistory.push({
        date: today,
        type: "work",
        duration: WORK_DURATION
    });

    localStorage.setItem(
        "pomodoroHistory",
        JSON.stringify(sessionHistory)
    );

    updateStats();
    }

    
function updateStats() {
  const todayEl = document.getElementById("today-count");
  const weekEl = document.getElementById("week-count");
  const minutesEl = document.getElementById("focus-minutes");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  let todayCount = 0;
  let weekCount = 0;
  let minutes = 0;

  sessionHistory.forEach(s => {
    const sessionDate = new Date(s.date);

    if (s.date === todayStr) todayCount++;
    if (sessionDate >= weekStart) weekCount++;

    minutes += s.duration;
  });

  todayEl.textContent = todayCount;
  weekEl.textContent = weekCount;
  minutesEl.textContent = minutes;
}
function enableFocusMode() {
  document.body.classList.add("focus-mode");
  document.body.classList.remove("break-mode");
}

function enableBreakMode() {
  document.body.classList.remove("focus-mode");
  document.body.classList.add("break-mode");
}
function updateUIMode() {
    if (currentSession === "work") {
        enableFocusMode();
        focusHint.textContent = "Focus Mode";
    } else {
        enableBreakMode();
        focusHint.textContent = "Break Time";
    }
}

// Initialize app
document.addEventListener("DOMContentLoaded", init);



