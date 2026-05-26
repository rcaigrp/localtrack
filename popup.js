// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer');
  const statusDisplay = document.getElementById('status');
  const btnStart = document.getElementById('start');
  const btnPause = document.getElementById('pause');
  const btnStop = document.getElementById('stop');
  const entryForm = document.getElementById('entry-form');
  const entriesList = document.getElementById('entries-list');
  const btnExportJson = document.getElementById('export-json');
  const btnExportCsv = document.getElementById('export-csv');
  const btnClear = document.getElementById('clear-storage');

  let timerInterval = null;
  let currentTimer = { startTime: null, elapsedTime: 0 };
  let entries = [];

  loadEntries();
  loadTimerState();
  renderEntries();
  updateTimerDisplay();

  function loadTimerState() {
    chrome.storage.local.get('timerState', (state) => {
      if (state.timerState && state.timerState.startTime) {
        currentTimer.startTime = state.timerState.startTime;
        currentTimer.elapsedTime = state.timerState.elapsedTime || 0;
        statusDisplay.textContent = 'Running';
        resumeTimer();
      } else {
        statusDisplay.textContent = 'Stopped';
      }
    });
  }

  function resumeTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }

  function updateTimerDisplay() {
    const now = Date.now();
    const totalSeconds = currentTimer.elapsedTime + (currentTimer.startTime ? Math.floor((now - currentTimer.startTime) / 1000) : 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function pad(n) {
    return n < 10 ? '0' + n : n.toString();
  }

  btnStart.addEventListener('click', () => {
    if (!currentTimer.startTime) {
      currentTimer.startTime = Date.now();
    }
    statusDisplay.textContent = 'Running';
    resumeTimer();
    saveTimerState();
  });

  btnPause.addEventListener('click', () => {
    if (currentTimer.startTime) {
      const now = Date.now();
      currentTimer.elapsedTime += (now - currentTimer.startTime);
      currentTimer.startTime = null;
      statusDisplay.textContent = 'Paused';
      if (timerInterval) clearInterval(timerInterval);
      saveTimerState();
    }
  });

  btnStop.addEventListener('click', () => {
    if (currentTimer.startTime) {
      const now = Date.now();
      currentTimer.elapsedTime += (now - currentTimer.startTime);
      currentTimer.startTime = null;
    }
    statusDisplay.textContent = 'Stopped';
    if (timerInterval) clearInterval(timerInterval);
    saveTimerState();
  });

  function saveTimerState() {
    chrome.storage.local.set({ timerState: currentTimer });
  }

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    const date = document.getElementById('entry-date').value;
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const notes = document.getElementById('notes').value;

    const durationSeconds = (hours * 3600) + (minutes * 60);
    const duration = `${hours}h ${minutes}m`;

    const newEntry = {
      id: Date.now(),
      project: projectName,
      date: date,
      duration: duration,
      durationSeconds: durationSeconds,
      notes: notes,
      type: 'manual'
    };

    entries.push(newEntry);
    saveEntries();
    renderEntries();
    entryForm.reset();
  });

  function saveEntries() {
    chrome.storage.local.set({ entries: entries });
  }

  function loadEntries() {
    chrome.storage.local.get('entries', (data) => {
      if (data.entries) {
        entries = data.entries;
      } else {
        entries = [];
      }
    });
  }

  function renderEntries() {
    entriesList.innerHTML = '';
    const recent = entries.slice(0, 5).reverse();
    recent.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} (${entry.date}): ${entry.duration} - ${entry.notes}`;
      entriesList.appendChild(li);
    });
  }

  btnExportJson.addEventListener('click', () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localtrack_entries.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnExportCsv.addEventListener('click', () => {
    let csv = 'Project,Date,Duration,Notes\n';
    entries.forEach(entry => {
      csv += `${entry.project},${entry.date},${entry.duration},${entry.notes}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localtrack_entries.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnClear.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      entries = [];
      currentTimer = { startTime: null, elapsedTime: 0 };
      renderEntries();
      updateTimerDisplay();
      statusDisplay.textContent = 'Stopped';
    });
  });
});