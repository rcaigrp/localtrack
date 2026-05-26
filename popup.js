// popup.js

const TIMER_KEY = 'localTrackTimer';
const ENTRIES_KEY = 'localTrackEntries';

let timerInterval = null;
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const stopBtn = document.getElementById('stop');
const entryForm = document.getElementById('entry-form');
const exportJsonBtn = document.getElementById('export-json');
const exportCsvBtn = document.getElementById('export-csv');
const clearBtn = document.getElementById('clear');
const entryList = document.getElementById('entry-list');

// Initialize
function init() {
  loadEntries();
  restoreTimer();
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);
  entryForm.addEventListener('submit', handleManualEntry);
  exportJsonBtn.addEventListener('click', exportJSON);
  exportCsvBtn.addEventListener('click', exportCSV);
  clearBtn.addEventListener('click', clearData);
}

function restoreTimer() {
  chrome.storage.local.get(TIMER_KEY, (data) => {
    if (data[TIMER_KEY]) {
      const timerState = data[TIMER_KEY];
      if (timerState.isRunning) {
        startTimer();
        updateDisplay(timerState.accumulated);
      } else {
        updateDisplay(timerState.accumulated);
      }
    }
  });
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  const startTime = Date.now();
  chrome.storage.local.get(TIMER_KEY, (data) => {
    const accumulated = data[TIMER_KEY]?.accumulated || 0;
    const state = { isRunning: true, startTime: startTime, accumulated: accumulated };
    chrome.storage.local.set({ [TIMER_KEY]: state });
    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const total = accumulated + elapsed;
      updateDisplay(total);
    }, 1000);
  });
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(timerInterval);
  const startTime = Date.now();
  const elapsed = startTime - getStoredStartTime();
  chrome.storage.local.get(TIMER_KEY, (data) => {
    const state = data[TIMER_KEY];
    if (state) {
      const newState = { isRunning: false, startTime: startTime, accumulated: state.accumulated + elapsed };
      chrome.storage.local.set({ [TIMER_KEY]: newState });
    }
    updateDisplay(newState.accumulated);
  });
}

function getStoredStartTime() {
  let stored = 0;
  chrome.storage.local.get(TIMER_KEY, (data) => {
    if (data[TIMER_KEY]?.startTime) {
      stored = data[TIMER_KEY].startTime;
    }
  });
  return stored;
}

function stopTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(timerInterval);
  const startTime = Date.now();
  const elapsed = startTime - getStoredStartTime();
  chrome.storage.local.get(TIMER_KEY, (data) => {
    const state = data[TIMER_KEY];
    const newState = { isRunning: false, startTime: 0, accumulated: state.accumulated + elapsed };
    chrome.storage.local.set({ [TIMER_KEY]: newState });
    updateDisplay(newState.accumulated);
    timerDisplay.textContent = formatTime(newState.accumulated);
  });
}

function updateDisplay(ms) {
  timerDisplay.textContent = formatTime(ms);
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function handleManualEntry(e) {
  e.preventDefault();
  const project = document.getElementById('project').value;
  const date = document.getElementById('date').value;
  const duration = parseFloat(document.getElementById('duration').value);
  const notes = document.getElementById('notes').value;

  if (!project || !date || isNaN(duration)) {
    alert('Please enter valid project, date, and duration.');
    return;
  }

  const entry = {
    id: Date.now(),
    project,
    date,
    duration,
    notes,
    timestamp: new Date().toISOString()
  };

  chrome.storage.local.get(ENTRIES_KEY, (data) => {
    const entries = data[ENTRIES_KEY] || [];
    entries.unshift(entry);
    chrome.storage.local.set({ [ENTRIES_KEY]: entries });
    loadEntries();
    entryForm.reset();
  });
}

function loadEntries() {
  chrome.storage.local.get(ENTRIES_KEY, (data) => {
    const entries = data[ENTRIES_KEY] || [];
    entryList.innerHTML = '';
    entries.slice(0, 10).forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} (${entry.date}): ${entry.duration}h`; 
      entryList.appendChild(li);
    });
  });
}

function exportJSON() {
  chrome.storage.local.get(ENTRIES_KEY, (data) => {
    const entries = data[ENTRIES_KEY] || [];
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    download(blob, 'localtrack_entries.json');
  });
}

function exportCSV() {
  chrome.storage.local.get(ENTRIES_KEY, (data) => {
    const entries = data[ENTRIES_KEY] || [];
    const csv = entries.map(e => `${e.project},${e.date},${e.duration},${e.notes}`).join('\n');
    const header = 'Project,Date,Duration,Notes';
    const blob = new Blob([header + '\n' + csv], { type: 'text/csv' });
    download(blob, 'localtrack_entries.csv');
  });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearData() {
  if (confirm('Are you sure you want to clear all data?')) {
    chrome.storage.local.clear();
    loadEntries();
    updateDisplay(0);
  }
}

document.addEventListener('DOMContentLoaded', init);
