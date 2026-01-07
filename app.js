let sessionHistory = JSON.parse(
  localStorage.getItem("pomodoroHistory")
) || [];

// === DOM Elements ===
const timerDisplay = document.getElementById("timer");
const sessionTypeDisplay = document.getElementById("session-type");
const progressBar = document.getElementById("progress-bar");
const timerSection = document.getElementById("timer-section");
const activeTaskText = document.getElementById("active-task-text");
const focusHint = document.getElementById("focus-hint");

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
    updateSessionLabel();
}

function attachEventListeners() {
    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);
    skipBtn.addEventListener("click", skipSession);

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", e => {
        if (e.key === "Enter") addTask();
    });

    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    } else {
        console.warn("Theme toggle button not found");
    }
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
    handleSessionEnd();
}

function handleSessionEnd() {
    playNotificationSound();

    if (currentSession === "work") {
        pomodoroCount++;
        sessionsCompleted++;
        incrementTaskPomodoro();
        updatePomodoroIndicator();
        recordSession();
        
        // 🎉 Trigger confetti when completing 4 pomodoros!
        if (sessionsCompleted % 4 === 0) {
            createConfetti();
            resetPomodoroIndicator();
        }
        
        currentSession = (sessionsCompleted % 4 === 0) ? "long" : "short";
    } else {
        currentSession = "work";
    }

    unlockTasks();
    updateSessionLabel();

    timerSeconds = getSessionDuration(currentSession) * 60;
    updateTimerDisplay();
    updateProgress();
    updateUIMode();

    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
}
function createConfetti() {
    const colors = ["#a5b4fc", "#fbcfe8", "#99f6e4", "#fde68a"];

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.background =
            colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration =
            Math.random() * 2 + 2 + "s";

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
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
    if (selectedTaskId === taskId) {
        selectedTaskId = null;
        activeTaskText.textContent = "No task selected";
    }
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
            <button class="task-delete-btn" data-id="${task.id}">✕</button>
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
    audio.play().catch(err => console.log("Audio playback failed:", err));
}

// === Theme ===
// === Theme ===
function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";

    if (savedTheme === "dark") {
        enableDarkMode();
        themeToggle.textContent = "☀️";
    } else {
        disableDarkMode();
        themeToggle.textContent = "🌙";
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-mode");

    if (isDark) {
        disableDarkMode();
        localStorage.setItem("theme", "light");
    } else {
        enableDarkMode();
        localStorage.setItem("theme", "dark");
    }
}

function enableDarkMode() {
    document.body.classList.add("dark-mode");

    document.body.classList.remove(
        "time-morning",
        "time-afternoon",
        "time-evening",
        "time-night"
    );
}

function disableDarkMode() {
    document.body.classList.remove("dark-mode");
    updateBackgroundByTime();
}


function toggleTheme() {
    const isDark = document.body.classList.contains("dark-mode");

    if (isDark) {
        disableDarkMode();
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "light");
    } else {
        enableDarkMode();
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "dark");
    }
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

// ===== AMBIENT SOUND GENERATOR =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentSound = null;
let gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
gainNode.gain.value = 0.5;

// Generate rain sound
function generateRain() {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 0.5;
    
    whiteNoise.connect(bandpass);
    bandpass.connect(gainNode);
    whiteNoise.start(0);
    
    return { source: whiteNoise, filter: bandpass };
}

// Generate ocean waves
function generateWaves() {
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator3.type = 'sine';
    
    oscillator1.frequency.value = 0.2;
    oscillator2.frequency.value = 0.15;
    oscillator3.frequency.value = 0.1;
    
    const lfo = audioContext.createOscillator();
    lfo.frequency.value = 0.05;
    
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 200;
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator1.frequency);
    lfoGain.connect(oscillator2.frequency);
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.1;
    
    oscillator1.connect(noiseGain);
    oscillator2.connect(noiseGain);
    oscillator3.connect(noiseGain);
    noiseGain.connect(gainNode);
    
    oscillator1.start(0);
    oscillator2.start(0);
    oscillator3.start(0);
    lfo.start(0);
    
    return { oscillators: [oscillator1, oscillator2, oscillator3, lfo] };
}

// Generate forest ambience
function generateForest() {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    
    const chirp = audioContext.createOscillator();
    chirp.type = 'sine';
    chirp.frequency.value = 2000;
    
    const chirpGain = audioContext.createGain();
    chirpGain.gain.value = 0.02;
    
    const lfo = audioContext.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 0.015;
    
    lfo.connect(lfoGain);
    lfoGain.connect(chirpGain.gain);
    
    whiteNoise.connect(lowpass);
    lowpass.connect(gainNode);
    
    chirp.connect(chirpGain);
    chirpGain.connect(gainNode);
    
    whiteNoise.start(0);
    chirp.start(0);
    lfo.start(0);
    
    return { source: whiteNoise, chirp, lfo };
}

// Generate café ambience
function generateCafe() {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 400;
    bandpass.Q.value = 1;
    
    whiteNoise.connect(bandpass);
    bandpass.connect(gainNode);
    whiteNoise.start(0);
    
    return { source: whiteNoise };
}

// Generate white noise
function generateWhiteNoise() {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    whiteNoise.connect(gainNode);
    whiteNoise.start(0);
    
    return { source: whiteNoise };
}

// Stop current sound
function stopCurrentSound() {
    if (!currentSound) return;
    
    try {
        if (currentSound.source) currentSound.source.stop();
        if (currentSound.filter) currentSound.filter.disconnect();
        if (currentSound.chirp) currentSound.chirp.stop();
        if (currentSound.lfo) currentSound.lfo.stop();
        if (currentSound.oscillators) {
            currentSound.oscillators.forEach(osc => osc.stop());
        }
    } catch (e) {
        // Already stopped
    }
    
    currentSound = null;
}

// Initialize sound controls
function initSoundControls() {
    document.querySelectorAll('.sound-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const soundType = this.getAttribute('data-sound');
            
            if (this.classList.contains('active')) {
                stopCurrentSound();
                this.classList.remove('active');
                return;
            }
            
            document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
            stopCurrentSound();
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            switch(soundType) {
                case 'rain':
                    currentSound = generateRain();
                    break;
                case 'waves':
                    currentSound = generateWaves();
                    break;
                case 'forest':
                    currentSound = generateForest();
                    break;
                case 'cafe':
                    currentSound = generateCafe();
                    break;
                case 'whitenoise':
                    currentSound = generateWhiteNoise();
                    break;
            }
            
            this.classList.add('active');
        });
    });

    document.getElementById('volume-slider').addEventListener('input', function() {
        gainNode.gain.value = this.value / 100;
    });
}

// Confetti function
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#a8edea', '#fed6e3', '#f6d365', '#fda085'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();
            
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

// Dynamic background based on time of day
function updateBackgroundByTime() {
    const hour = new Date().getHours();
    const body = document.body;
    
    body.classList.remove('time-morning', 'time-afternoon', 'time-evening', 'time-night');
    
    if (body.classList.contains('dark-mode')) return;
    
    if (hour >= 5 && hour < 12) {
        body.classList.add('time-morning');
    } else if (hour >= 12 && hour < 17) {
        body.classList.add('time-afternoon');
    } else if (hour >= 17 && hour < 21) {
        body.classList.add('time-evening');
    } else {
        body.classList.add('time-night');
    }
}
function launchConfetti() {
    const duration = 1200;
    const end = Date.now() + duration;

    const colors = ["#a5b4fc", "#fbcfe8", "#99f6e4", "#fde68a"];

    (function frame() {
        const timeLeft = end - Date.now();
        if (timeLeft <= 0) return;

        const particle = document.createElement("div");
        particle.style.position = "fixed";
        particle.style.top = "-10px";
        particle.style.left = Math.random() * window.innerWidth + "px";
        particle.style.width = "8px";
        particle.style.height = "8px";
        particle.style.background =
            colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = "50%";
        particle.style.opacity = "0.9";
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "9999";

        document.body.appendChild(particle);

        let fall = 0;
        const speed = Math.random() * 3 + 2;

        const drop = setInterval(() => {
            fall += speed;
            particle.style.transform = `translateY(${fall}px)`;

            if (fall > window.innerHeight) {
                clearInterval(drop);
                particle.remove();
            }
        }, 16);

        requestAnimationFrame(frame);
    })();
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    init();
    initSoundControls();
    updateBackgroundByTime();
    setInterval(updateBackgroundByTime, 60000);
});