let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

// DOM elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const timeDisplay = document.getElementById('timeDisplay');

// Format time as HH:MM:SS
function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  
  seconds = seconds % 60;
  minutes = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update display with current elapsed time
function updateDisplay() {
  timeDisplay.textContent = formatTime(elapsedTime);
}

// Save timer state to storage
function saveTimerState() {
  const timerData = {
    isRunning: isRunning,
    elapsedTime: elapsedTime,
    startTime: startTime
  };
  
  chrome.storage.local.set({timerData: timerData}, function() {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
    }
  });
}

// Load timer state from storage
function loadTimerState() {
  chrome.storage.local.get(['timerData'], function(result) {
    if (result.timerData) {
      const data = result.timerData;
      isRunning = data.isRunning;
      elapsedTime = data.elapsedTime;
      startTime = data.startTime;
      
      updateDisplay();
      
      if (isRunning) {
        startTimer();
      }
    }
  });
}

// Start the timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      updateDisplay();
      saveTimerState();
    }, 1000);
    
    saveTimerState();
  }
}

// Pause the timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
    saveTimerState();
  }
}

// Stop the timer
function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  elapsedTime = 0;
  startTime = 0;
  updateDisplay();
  saveTimerState();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);

// Initialize timer state on popup load
loadTimerState();