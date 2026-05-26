// LocalTrack - Popup Logic

let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const entryForm = document.getElementById('entryForm');
const entriesList = document.getElementById('entriesList');
const totalHoursSpan = document.getElementById('totalHours');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');

// Initialize the popup
function init() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // Load saved data
  loadEntries();
  loadTimerState();
  
  // Set up event listeners
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);
  entryForm.addEventListener('submit', saveEntry);
  clearBtn.addEventListener('click', clearAllEntries);
  exportBtn.addEventListener('click', exportData);
  
  // Update timer display immediately
  updateTimerDisplay();
}

// Timer functions
function startTimer() {
  if (!isRunning) {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
    isRunning = true;
    saveTimerState();
  }
}

function pauseTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = Date.now() - startTime;
    saveTimerState();
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  elapsedTime = 0;
  startTime = 0;
  updateTimerDisplay();
  saveTimerState();
}

function updateTimer() {
  elapsedTime = Date.now() - startTime;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  
  timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function saveTimerState() {
  const state = {
    isRunning,
    startTime,
    elapsedTime
  };
  chrome.storage.local.set({ timerState: state });
}

function loadTimerState() {
  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState) {
      const { isRunning, startTime, elapsedTime } = result.timerState;
      
      if (isRunning) {
        // Resume timer
        this.isRunning = true;
        this.startTime = startTime;
        this.elapsedTime = elapsedTime;
        timerInterval = setInterval(updateTimer, 1000);
      }
      
      updateTimerDisplay();
    }
  });
}

// Entry functions
function saveEntry(e) {
  e.preventDefault();
  
  // Get form values
  const projectName = document.getElementById('projectName').value;
  const date = document.getElementById('date').value;
  const durationInput = document.getElementById('duration').value;
  const notes = document.getElementById('notes').value;
  
  // Validate duration format (HH:MM)
  if (!validateDuration(durationInput)) {
    alert('Please enter duration in HH:MM format');
    return;
  }
  
  // Parse duration to minutes
  const [hours, minutes] = durationInput.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Create entry object
  const entry = {
    id: Date.now(),
    project: projectName,
    date,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + totalMinutes * 60000).toISOString(),
    duration: totalMinutes,
    notes
  };
  
  // Save to storage
  saveEntryToStorage(entry);
  
  // Reset form
  entryForm.reset();
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

function validateDuration(duration) {
  const regex = /^([0-9]{1,2}):([0-5][0-9])$/;
  return regex.test(duration);
}

function saveEntryToStorage(entry) {
  chrome.storage.local.get(['entries'], (result) => {
    const entries = result.entries || [];
    entries.unshift(entry); // Add to beginning of array
    chrome.storage.local.set({ entries }, () => {
      loadEntries();
      updateSummary();
    });
  });
}

function loadEntries() {
  chrome.storage.local.get(['entries'], (result) => {
    const entries = result.entries || [];
    renderEntries(entries);
    updateSummary();
  });
}

function renderEntries(entries) {
  entriesList.innerHTML = '';
  
  // Show only last 10 entries
  const recentEntries = entries.slice(0, 10);
  
  recentEntries.forEach(entry => {
    const entryElement = document.createElement('li');
    
    const dateObj = new Date(entry.date);
    const formattedDate = dateObj.toLocaleDateString();
    
    const durationHours = Math.floor(entry.duration / 60);
    const durationMinutes = entry.duration % 60;
    const formattedDuration = `${durationHours}h ${durationMinutes}m`;
    
    entryElement.innerHTML = `
      <div><strong>${entry.project}</strong></div>
      <div class="entry-details">${formattedDate} • ${formattedDuration}</div>
      ${entry.notes ? `<div class="entry-details">${entry.notes}</div>` : ''}
    `;
    
    entriesList.appendChild(entryElement);
  });
}

function updateSummary() {
  chrome.storage.local.get(['entries'], (result) => {
    const entries = result.entries || [];
    const today = new Date().toISOString().split('T')[0];
    
    // Filter entries for today
    const todayEntries = entries.filter(entry => entry.date === today);
    
    // Calculate total hours
    const totalMinutes = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(2);
    
    totalHoursSpan.textContent = totalHours;
  });
}

function clearAllEntries() {
  if (confirm('Are you sure you want to delete all entries?')) {
    chrome.storage.local.set({ entries: [] }, () => {
      loadEntries();
      updateSummary();
    });
  }
}

function exportData() {
  chrome.storage.local.get(['entries'], (result) => {
    const entries = result.entries || [];
    
    // Export as JSON
    const jsonBlob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    
    // Create download link for JSON
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `localtrack-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
    
    // Export as CSV
    const csvContent = convertEntriesToCSV(entries);
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    
    // Create download link for CSV
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `localtrack-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
  });
}

function convertEntriesToCSV(entries) {
  if (entries.length === 0) return '';
  
  const headers = ['ID', 'Project', 'Date', 'Start Time', 'End Time', 'Duration (minutes)', 'Notes'];
  
  const rows = entries.map(entry => [
    entry.id,
    entry.project,
    entry.date,
    entry.startTime,
    entry.endTime,
    entry.duration,
    entry.notes ? entry.notes.replace(/,/g, ';') : ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

// Initialize the popup when loaded
window.addEventListener('load', init);