// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const entryForm = document.getElementById('entry-form');
const entriesList = document.getElementById('entries-list');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const todaySummary = document.getElementById('today-summary');

// Timer state variables
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let isRunning = false;

// Initialize extension
async function initExtension() {
  // Load saved data
  await loadEntries();
  
  // Load timer state
  const result = await chrome.storage.local.get(['timerState']);
  if (result.timerState) {
    isRunning = result.timerState.isRunning;
    startTime = result.timerState.startTime;
    elapsedTime = result.timerState.elapsedTime;
    
    if (isRunning) {
      // Resume timer
      startTimer();
    }
    
    updateTimerDisplay();
  }
  
  // Set today's date as default for form
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('entry-date').value = today;
}

// Timer functions
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimerDisplay, 1000);
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'startTimer' });
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'pauseTimer' });
  }
}

function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  elapsedTime = 0;
  
  // Notify background script
  chrome.runtime.sendMessage({ action: 'stopTimer' });
  updateTimerDisplay();
}

function updateTimerDisplay() {
  if (isRunning) {
    const now = Date.now();
    elapsedTime = now - startTime;
  }
  
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  
  timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Manual entry functions
async function saveEntry(event) {
  event.preventDefault();
  
  const projectName = document.getElementById('project-name').value;
  const date = document.getElementById('entry-date').value;
  const hours = parseInt(document.getElementById('hours').value) || 0;
  const minutes = parseInt(document.getElementById('minutes').value) || 0;
  const notes = document.getElementById('notes').value;
  
  // Validate inputs
  if (!projectName || !date) {
    alert('Project name and date are required');
    return;
  }
  
  if (hours < 0 || minutes < 0 || hours > 23 || minutes > 59) {
    alert('Invalid time format');
    return;
  }
  
  // Calculate duration in milliseconds
  const duration = (hours * 3600000) + (minutes * 60000);
  
  // Create entry object
  const newEntry = {
    id: Date.now(),
    project: projectName,
    date,
    startTime: null,
    endTime: null,
    duration,
    notes
  };
  
  // Save to storage
  await saveToStorage(newEntry);
  
  // Reset form
  entryForm.reset();
  document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
  
  // Update UI
  await loadEntries();
}

// Storage functions
async function saveToStorage(entry) {
  const result = await chrome.storage.local.get(['entries']);
  let entries = result.entries || [];
  entries.push(entry);
  await chrome.storage.local.set({ entries });
}

async function loadEntries() {
  const result = await chrome.storage.local.get(['entries']);
  const entries = result.entries || [];
  
  // Calculate today's summary
  const today = new Date().toISOString().split('T')[0];
  let totalMinutes = 0;
  
  entries.forEach(entry => {
    if (entry.date === today) {
      totalMinutes += entry.duration / 60000;
    }
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  todaySummary.textContent = `Total: ${hours} hours ${minutes} minutes`;
  
  // Display recent entries
  displayEntries(entries);
}

function displayEntries(entries) {
  // Sort by date descending
  const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  entriesList.innerHTML = '';
  
  // Show only last 5 entries
  const recentEntries = sortedEntries.slice(0, 5);
  
  recentEntries.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'entry-item';
    
    const hours = Math.floor(entry.duration / 3600000);
    const minutes = Math.floor((entry.duration % 3600000) / 60000);
    
    entryElement.innerHTML = `
      <div class="entry-header">
        <span class="project-name">${entry.project}</span>
        <span class="duration">${hours}h ${minutes}m</span>
      </div>
      <div class="entry-details">
        <span class="date">${entry.date}</span>
        ${entry.notes ? `<p class="notes">${entry.notes}</p>` : ''}
      </div>
    `;
    
    entriesList.appendChild(entryElement);
  });
}

// Export functions
async function exportData() {
  const result = await chrome.storage.local.get(['entries']);
  const entries = result.entries || [];
  
  if (entries.length === 0) {
    alert('No data to export');
    return;
  }
  
  // Export as JSON
  const jsonBlob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = 'localtrack-export.json';
  document.body.appendChild(jsonLink);
  jsonLink.click();
  document.body.removeChild(jsonLink);
  URL.revokeObjectURL(jsonUrl);
  
  // Export as CSV
  const csvContent = convertToCSV(entries);
  const csvBlob = new Blob([csvContent], { type: 'text/csv' });
  const csvUrl = URL.createObjectURL(csvBlob);
  
  const csvLink = document.createElement('a');
  csvLink.href = csvUrl;
  csvLink.download = 'localtrack-export.csv';
  document.body.appendChild(csvLink);
  csvLink.click();
  document.body.removeChild(csvLink);
  URL.revokeObjectURL(csvUrl);
}

function convertToCSV(entries) {
  const headers = ['id', 'project', 'date', 'startTime', 'endTime', 'duration', 'notes'];
  
  const csvRows = [
    headers.join(',')
  ];
  
  entries.forEach(entry => {
    const row = [
      entry.id,
      entry.project,
      entry.date,
      entry.startTime || '',
      entry.endTime || '',
      entry.duration,
      entry.notes ? '"' + entry.notes.replace(/"/g, '""') + '"' : ''
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// Clear all data
async function clearAllData() {
  if (confirm('Are you sure you want to delete all entries?')) {
    await chrome.storage.local.set({ entries: [] });
    await loadEntries();
  }
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
entryForm.addEventListener('submit', saveEntry);
exportBtn.addEventListener('click', exportData);
clearBtn.addEventListener('click', clearAllData);

// Initialize extension when popup loads
window.addEventListener('load', initExtension);