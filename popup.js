let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

const timeDisplay = document.getElementById('timeDisplay');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(elapsedTime);
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    
    timerInterval = setInterval(() => {
      if (isRunning) {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
        // Save to storage on every tick for persistence
        chrome.storage.local.set({
          timerState: {
            isRunning,
            startTime,
            elapsedTime
          }
        });
      }
    }, 10);
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
    // Save to storage when paused
    chrome.storage.local.set({
      timerState: {
        isRunning,
        startTime,
        elapsedTime
      }
    });
  }
}

function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  elapsedTime = 0;
  updateDisplay();
  // Save to storage when stopped
  chrome.storage.local.set({
    timerState: {
      isRunning,
      startTime,
      elapsedTime
    }
  });
}

// Load saved timer state on popup open
chrome.storage.local.get(['timerState'], (result) => {
  if (result.timerState) {
    const state = result.timerState;
    isRunning = state.isRunning;
    startTime = state.startTime;
    elapsedTime = state.elapsedTime;
    
    if (isRunning) {
      startTimer();
    }
    updateDisplay();
  }
});

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
stopButton.addEventListener('click', stopTimer);