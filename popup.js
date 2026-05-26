// popup.js
const STORAGE_KEY = 'localTrackEntries';
const TIMER_KEY = 'localTrackTimer';

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  const manualForm = document.getElementById('manualForm');
  const entriesList = document.getElementById('entriesList');
  const exportJsonBtn = document.getElementById('exportJson');
  const exportCsvBtn = document.getElementById('exportCsv');
  const clearBtn = document.getElementById('clearBtn');

  let timerInterval = null;
  let timerState = { status: 'stopped', startTime: null };

  // Load timer state
  chrome.storage.local.get(TIMER_KEY, (data) => {
    if (data[TIMER_KEY]) {
      timerState = data[TIMER_KEY];
      if (timerState.status === 'running') {
        startTimer();
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline';
        stopBtn.style.display = 'inline';
      } else {
        resetTimerUI();
      }
    }
  });

  function startTimer() {
    const now = Date.now();
    if (timerState.status === 'stopped' || timerState.status === 'paused') {
      timerState.startTime = now;
      timerState.status = 'running';
    }
    saveTimerState();
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    timerState.status = 'paused';
    saveTimerState();
    startBtn.style.display = 'inline';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
  }

  function stopTimer() {
    clearInterval(timerInterval);
    const endTime = Date.now();
    const durationMs = endTime - timerState.startTime;
    const durationSec = durationMs / 1000;

    const entry = {
      id: Date.now(),
      project: 'Timer',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(timerState.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: durationSec,
      notes: ''
    };

    saveEntry(entry);
    timerState.status = 'stopped';
    saveTimerState();
    resetTimerUI();
  }

  function resetTimerUI() {
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00:00';
    startBtn.style.display = 'inline';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
  }

  function updateTimerDisplay() {
    const now = Date.now();
    const elapsed = now - timerState.startTime;
    const date = new Date(elapsed);
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    timerDisplay.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function saveTimerState() {
    chrome.storage.local.set({ [TIMER_KEY]: timerState });
  }

  function saveEntry(entry) {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const entries = data[STORAGE_KEY] || [];
      entries.push(entry);
      chrome.storage.local.set({ [STORAGE_KEY]: entries }, () => {
        loadEntries();
      });
    });
  }

  function loadEntries() {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const entries = data[STORAGE_KEY] || [];
      entriesList.innerHTML = '';
      entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.textContent = `${entry.project} - ${entry.duration}s`;
        entriesList.appendChild(div);
      });
    });
  }

  // Event listeners
  startBtn.addEventListener('click', () => {
    startTimer();
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline';
    stopBtn.style.display = 'inline';
  });

  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);

  manualForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = document.getElementById('project').value;
    const date = document.getElementById('date').value;
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const notes = document.getElementById('notes').value;

    const duration = hours * 3600 + minutes * 60;
    const entry = {
      id: Date.now(),
      project,
      date,
      startTime: null,
      endTime: null,
      duration,
      notes
    };
    saveEntry(entry);
    manualForm.reset();
  });

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const entries = data[STORAGE_KEY] || [];
      const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const entries = data[STORAGE_KEY] || [];
      const csv = entries.map(e => `${e.project},${e.date},${e.duration},${e.notes}`).join('\n');
      const header = 'Project,Date,Duration(seconds),Notes\n';
      const blob = new Blob([header + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      timerState = { status: 'stopped', startTime: null };
      saveTimerState();
      loadEntries();
      resetTimerUI();
    });
  });

  loadEntries();
});