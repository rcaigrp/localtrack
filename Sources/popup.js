const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const resetButton = document.getElementById('resetBtn');
const manualEntryForm = document.getElementById('manualEntryForm');
const exportButton = document.getElementById('exportBtn');

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;

// Timer state management
const saveTimerState = (state) => {
  chrome.storage.local.set({timerState: state});
};

const loadTimerState = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['timerState'], (result) => {
      resolve(result.timerState || null);
    });
  });
};

// Format time in HH:MM:SS
const formatTime = (ms) => {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  
  seconds = seconds % 60;
  minutes = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Update timer display
const updateDisplay = () => {
  const currentTime = Date.now();
  const totalElapsed = elapsedTime + (isRunning ? (currentTime - startTime) : 0);
  timerDisplay.textContent = formatTime(totalElapsed);
};

// Animation frame based timer update
const animateTimer = () => {
  if (isRunning) {
    updateDisplay();
    // Save state on every animation frame for smooth persistence
    saveTimerState({
      isRunning,
      elapsedTime,
      startTime: Date.now() - (elapsedTime % 1000)
    });
    requestAnimationFrame(animateTimer);
  } else {
    updateDisplay();
  }
};

// Start timer
const startTimer = () => {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    animateTimer();
  }
};

// Pause timer
const pauseTimer = () => {
  if (isRunning) {
    isRunning = false;
    const currentTime = Date.now();
    elapsedTime += (currentTime - startTime);
    saveTimerState({
      isRunning,
      elapsedTime,
      startTime: null
    });
  }
};

// Reset timer
const resetTimer = () => {
  isRunning = false;
  elapsedTime = 0;
  startTime = 0;
  saveTimerState({
    isRunning,
    elapsedTime,
    startTime: null
  });
  updateDisplay();
};

// Load saved timer state on popup open
const initializeTimer = async () => {
  const savedState = await loadTimerState();
  if (savedState) {
    isRunning = savedState.isRunning;
    elapsedTime = savedState.elapsedTime;
    
    if (isRunning) {
      startTime = Date.now() - elapsedTime;
      animateTimer();
    }
  }
  updateDisplay();
};

// Event listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// Initialize timer on popup load
initializeTimer();