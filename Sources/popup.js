let timerInterval;
let seconds = 0;
let isRunning = false;

// DOM elements
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const timeDisplay = document.getElementById('timeDisplay');
const projectForm = document.getElementById('projectForm');
const projectNameInput = document.getElementById('projectName');
const projectDescInput = document.getElementById('projectDesc');
const entriesList = document.getElementById('entriesList');

// Load saved data on popup open
window.onload = function() {
  loadTimerState();
  loadEntries();
};

// Timer functions
function startStopTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    startStopBtn.textContent = 'Start';
  } else {
    isRunning = true;
    startStopBtn.textContent = 'Pause';
    timerInterval = setInterval(() => {
      seconds++;
      updateDisplay();
      saveTimerState(); // Save state on every tick
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  seconds = 0;
  startStopBtn.textContent = 'Start';
  updateDisplay();
  saveTimerState(); // Save state after reset
}

function updateDisplay() {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Timer persistence functions
function saveTimerState() {
  const timerData = {
    seconds: seconds,
    isRunning: isRunning
  };
  chrome.storage.local.set({timerData: timerData});
}

function loadTimerState() {
  chrome.storage.local.get(['timerData'], function(result) {
    if (result.timerData) {
      seconds = result.timerData.seconds;
      isRunning = result.timerData.isRunning;
      updateDisplay();
      
      if (isRunning) {
        startStopBtn.textContent = 'Pause';
        timerInterval = setInterval(() => {
          seconds++;
          updateDisplay();
          saveTimerState();
        }, 1000);
      }
    }
  });
}

// Manual entry functions
function saveEntry(projectName, projectDesc) {
  const newEntry = {
    id: Date.now(), // Simple unique ID
    name: projectName,
    description: projectDesc,
    timeSpent: seconds
  };
  
  chrome.storage.local.get(['entries'], function(result) {
    let entries = result.entries || [];
    entries.push(newEntry);
    chrome.storage.local.set({entries: entries}, function() {
      loadEntries(); // Reload entries after saving
    });
  });
}

function loadEntries() {
  chrome.storage.local.get(['entries'], function(result) {
    const entries = result.entries || [];
    renderEntries(entries);
  });
}

function renderEntries(entries) {
  entriesList.innerHTML = '';
  entries.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'entry';
    entryElement.innerHTML = `
      <h3>${entry.name}</h3>
      <p>${entry.description}</p>
      <p>Time: ${formatTime(entry.timeSpent)}</p>
    `;
    entriesList.appendChild(entryElement);
  });
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Form submission handler
projectForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const projectName = projectNameInput.value.trim();
  const projectDesc = projectDescInput.value.trim();
  
  if (projectName) {
    saveEntry(projectName, projectDesc);
    // Clear form
    projectNameInput.value = '';
    projectDescInput.value = '';
  }
});

// Event listeners
startStopBtn.addEventListener('click', startStopTimer);
resetBtn.addEventListener('click', resetTimer);