let timerInterval;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

// DOM elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const saveEntryBtn = document.getElementById('save-entry-btn');
const projectInput = document.getElementById('project-input');
const entriesList = document.getElementById('entries-list');

// Format time as HH:MM:SS
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update display with current time
function updateDisplay() {
  const currentTime = isRunning ? Date.now() - startTime : elapsedTime;
  timeDisplay.textContent = formatTime(currentTime);
}

// Save timer state to storage
function saveTimerState() {
  const state = {
    isRunning,
    startTime,
    elapsedTime
  };
  chrome.storage.local.set({timerState: state});
}

// Load timer state from storage
function loadTimerState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const {isRunning, startTime, elapsedTime} = result.timerState;
        if (isRunning) {
          // If timer was running, calculate new start time
          const now = Date.now();
          const newStartTime = now - elapsedTime;
          this.startTime = newStartTime;
          this.isRunning = true;
          startTimer();
        } else {
          this.isRunning = false;
          this.elapsedTime = elapsedTime;
          updateDisplay();
        }
      }
      resolve();
    });
  });
}

// Start the timer
function startTimer() {
  if (!isRunning) {
    startTime = Date.now() - elapsedTime;
    isRunning = true;
    
    function tick() {
      if (isRunning) {
        updateDisplay();
        saveTimerState(); // Save state on every tick
        timerInterval = requestAnimationFrame(tick);
      }
    }
    
    timerInterval = requestAnimationFrame(tick);
  }
}

// Pause the timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    cancelAnimationFrame(timerInterval);
    saveTimerState();
  }
}

// Stop the timer
function stopTimer() {
  isRunning = false;
  cancelAnimationFrame(timerInterval);
  elapsedTime = 0;
  updateDisplay();
  saveTimerState();
}

// Reset the timer
function resetTimer() {
  isRunning = false;
  cancelAnimationFrame(timerInterval);
  elapsedTime = 0;
  updateDisplay();
  saveTimerState();
}

// Save manual entry to storage
function saveManualEntry() {
  const project = projectInput.value.trim();
  if (project) {
    const entry = {
      id: Date.now(),
      project,
      time: elapsedTime
    };
    
    chrome.storage.local.get(['entries'], (result) => {
      const entries = result.entries || [];
      entries.push(entry);
      chrome.storage.local.set({entries}, () => {
        // Update UI immediately
        renderEntries();
        projectInput.value = '';
      });
    });
  }
}

// Load and render manual entries
function renderEntries() {
  chrome.storage.local.get(['entries'], (result) => {
    const entries = result.entries || [];
    entriesList.innerHTML = '';
    entries.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = 'entry-item';
      entryElement.textContent = `${formatTime(entry.time)} - ${entry.project}`;
      entriesList.appendChild(entryElement);
    });
  });
}

// Export data
function exportData() {
  chrome.storage.local.get(['entries', 'timerState'], (result) => {
    const data = {
      entries: result.entries || [],
      timerState: result.timerState
    };
    
    // Create JSON file
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(jsonBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localtrack-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Initialize the popup
async function initPopup() {
  await loadTimerState();
  renderEntries();
  
  // Set up event listeners
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);
  saveEntryBtn.addEventListener('click', saveManualEntry);
  
  // Update display initially
  updateDisplay();
}

// Initialize when popup loads
window.addEventListener('load', initPopup);
