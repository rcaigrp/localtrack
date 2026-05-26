let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

// DOM elements
const timeDisplay = document.getElementById('timeDisplay');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const addEntryButton = document.getElementById('addEntryButton');
const projectInput = document.getElementById('projectInput');
const descriptionInput = document.getElementById('descriptionInput');
const entriesList = document.getElementById('entriesList');

// Format time as HH:MM:SS
function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  
  seconds = seconds % 60;
  minutes = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update UI with current time
function updateDisplay() {
  if (isRunning) {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
  }
  
  timeDisplay.textContent = formatTime(elapsedTime);
}

// Save timer state to storage
function saveTimerState() {
  const state = {
    isRunning,
    startTime,
    elapsedTime
  };
  
  chrome.storage.local.set({timerState: state}, function() {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
    }
  });
}

// Load timer state from storage
function loadTimerState() {
  chrome.storage.local.get(['timerState'], function(result) {
    if (result.timerState) {
      const {isRunning: running, startTime: start, elapsedTime: elapsed} = result.timerState;
      isRunning = running;
      startTime = start;
      elapsedTime = elapsed;
      
      if (isRunning) {
        // Restart the timer
        startTimer();
      } else {
        updateDisplay();
      }
    } else {
      updateDisplay();
    }
  });
}

// Start the timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    
    // Use requestAnimationFrame for smoother updates
    function update() {
      if (isRunning) {
        updateDisplay();
        requestAnimationFrame(update);
      }
    }
    
    update();
    saveTimerState();
  }
}

// Pause the timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    saveTimerState();
  }
}

// Stop the timer
function stopTimer() {
  isRunning = false;
  elapsedTime = 0;
  updateDisplay();
  saveTimerState();
}

// Reset the timer
function resetTimer() {
  isRunning = false;
  elapsedTime = 0;
  updateDisplay();
  saveTimerState();
}

// Add a manual entry
function addManualEntry() {
  const project = projectInput.value.trim();
  const description = descriptionInput.value.trim();
  
  if (project) {
    const entry = {
      id: Date.now(),
      project,
      description,
      time: elapsedTime,
      timestamp: new Date().toISOString()
    };
    
    // Load existing entries
    chrome.storage.local.get(['entries'], function(result) {
      let entries = result.entries || [];
      entries.push(entry);
      
      // Save back to storage
      chrome.storage.local.set({entries}, function() {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
        }
        
        // Clear inputs
        projectInput.value = '';
        descriptionInput.value = '';
        
        // Update UI
        loadEntries();
      });
    });
  }
}

// Load manual entries from storage
function loadEntries() {
  chrome.storage.local.get(['entries'], function(result) {
    const entries = result.entries || [];
    
    // Clear existing list
    entriesList.innerHTML = '';
    
    // Add each entry to the list
    entries.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = 'entry-item';
      entryElement.innerHTML = `
        <strong>${entry.project}</strong> - ${formatTime(entry.time)}<br>
        <small>${entry.description || ''}</small>
      `;
      entriesList.appendChild(entryElement);
    });
  });
}

// Initialize the popup
function initPopup() {
  // Load saved state
  loadTimerState();
  
  // Load entries
  loadEntries();
  
  // Set up event listeners
  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  stopButton.addEventListener('click', stopTimer);
  resetButton.addEventListener('click', resetTimer);
  addEntryButton.addEventListener('click', addManualEntry);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  initPopup();
}