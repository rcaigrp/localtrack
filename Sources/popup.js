let timerInterval = null;
let seconds = 0;
let isRunning = false;

// DOM elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

// Update display with formatted time
function updateDisplay() {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Save timer state to storage
function saveTimerState() {
  const timerData = {
    seconds: seconds,
    isRunning: isRunning
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
      seconds = result.timerData.seconds;
      isRunning = result.timerData.isRunning;
      updateDisplay();
      
      if (isRunning) {
        startTimer();
      }
    }
  });
}

// Start the timer
function startTimer() {
  if (isRunning) return;
  
  isRunning = true;
  saveTimerState();
  
  function tick() {
    if (!isRunning) return;
    
    seconds++;
    updateDisplay();
    saveTimerState(); // Save state on every tick
    
    // Use requestAnimationFrame for better performance
    timerInterval = requestAnimationFrame(tick);
  }
  
  timerInterval = requestAnimationFrame(tick);
}

// Pause the timer
function pauseTimer() {
  isRunning = false;
  if (timerInterval) {
    cancelAnimationFrame(timerInterval);
  }
  saveTimerState();
}

// Stop the timer
function stopTimer() {
  isRunning = false;
  seconds = 0;
  if (timerInterval) {
    cancelAnimationFrame(timerInterval);
  }
  updateDisplay();
  saveTimerState();
}

// Reset the timer
function resetTimer() {
  isRunning = false;
  seconds = 0;
  if (timerInterval) {
    cancelAnimationFrame(timerInterval);
  }
  updateDisplay();
  saveTimerState();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Load saved state when popup opens
loadTimerState();