const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const saveEntryBtn = document.getElementById('saveEntryBtn');
const projectInput = document.getElementById('projectInput');
const timeInput = document.getElementById('timeInput');

let timerInterval;
let elapsedTime = 0;
let isRunning = false;

// Load saved timer state on popup open
window.addEventListener('load', function() {
  chrome.storage.local.get(['timerState'], function(result) {
    if (result.timerState) {
      const { elapsed, running } = result.timerState;
      elapsedTime = elapsed;
      isRunning = running;
      updateTimerDisplay();
      
      if (isRunning) {
        startTimer();
      }
    }
  });
});

// Save timer state when popup closes
window.addEventListener('beforeunload', function() {
  chrome.storage.local.set({
    timerState: {
      elapsed: elapsedTime,
      running: isRunning
    }
  });
});

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timerInterval = setInterval(() => {
      elapsedTime++;
      updateTimerDisplay();
    }, 1000);
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
  }
}

function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  elapsedTime = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;
  
  timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);

saveEntryBtn.addEventListener('click', function() {
  const project = projectInput.value;
  const time = timeInput.value;
  
  if (project && time) {
    // Save manual entry to storage
    chrome.storage.local.get(['entries'], function(result) {
      const entries = result.entries || [];
      entries.push({ project, time, timestamp: Date.now() });
      chrome.storage.local.set({ entries });
    });
    
    // Clear inputs
    projectInput.value = '';
    timeInput.value = '';
  }
});