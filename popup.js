document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const manualForm = document.getElementById('manual-form');
  const entryList = document.getElementById('entry-list');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const clearStorageBtn = document.getElementById('clear-storage-btn');

  let timerInterval = null;
  let timerState = { isRunning: false, startTime: null, elapsedTime: 0 };

  chrome.storage.local.get(['timerState'], (data) => {
    if (data.timerState) {
      timerState = data.timerState;
      if (timerState.isRunning) {
        resumeTimer();
      }
    }
    updateUI();
  });

  function saveTimerState() {
    chrome.runtime.sendMessage({ type: 'saveTimerState', state: timerState });
  }

  function startTimer() {
    timerState.isRunning = true;
    timerState.startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    saveTimerState();
    updateUI();
  }

  function pauseTimer() {
    timerState.isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    saveTimerState();
    updateUI();
  }

  function stopTimer() {
    timerState.isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    const entry = {
      id: Date.now(),
      project: 'Timer Session',
      date: new Date().toISOString().split('T')[0],
      startTime: timerState.startTime,
      endTime: Date.now(),
      duration: timerState.elapsedTime + (Date.now() - timerState.startTime),
      notes: 'Auto-generated from timer'
    };
    saveEntry(entry);
    timerState.elapsedTime = 0;
    timerState.startTime = null;
    saveTimerState();
    updateTimerDisplay();
    updateUI();
  }

  function resumeTimer() {
    timerState.isRunning = true;
    timerState.startTime = Date.now() - timerState.elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
    updateUI();
  }

  function updateTimer() {
    timerState.elapsedTime = Date.now() - timerState.startTime;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const seconds = Math.floor(timerState.elapsedTime / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  function pad(num) {
    return num < 10 ? '0' + num : num;
  }

  function updateUI() {
    startBtn.disabled = timerState.isRunning;
    pauseBtn.disabled = !timerState.isRunning;
    stopBtn.disabled = !timerState.isRunning;
  }

  manualForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    const date = document.getElementById('entry-date').value;
    const hours = parseFloat(document.getElementById('duration-hours').value) || 0;
    const minutes = parseFloat(document.getElementById('duration-minutes').value) || 0;
    const notes = document.getElementById('notes').value;

    if (!projectName || !date) {
      alert('Please enter Project Name and Date');
      return;
    }

    const duration = (hours * 3600 + minutes * 60) * 1000;
    const entry = {
      id: Date.now(),
      project: projectName,
      date: date,
      startTime: Date.now(),
      endTime: Date.now() + duration,
      duration: duration,
      notes: notes
    };

    saveEntry(entry);
    manualForm.reset();
    loadEntries();
  });

  function saveEntry(entry) {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ entries: entries });
      loadEntries();
    });
  }

  function loadEntries() {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entryList.innerHTML = '';
      entries.forEach(entry => {
        const li = document.createElement('li');
        const durationHours = (entry.duration / 1000 / 3600).toFixed(2);
        li.textContent = `${entry.project} (${entry.date}) - ${durationHours}h`;
        entryList.appendChild(li);
      });
    });
  }

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      const json = JSON.stringify(entries, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      const csv = entries.map(e => `${e.project},${e.date},${(e.duration / 1000 / 3600).toFixed(2)},${e.notes}`).join('\n');
      const header = 'Project,Date,Duration (h),Notes';
      const fullCsv = header + '\n' + csv;
      const blob = new Blob([fullCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  clearStorageBtn.addEventListener('click', () => {
    chrome.storage.local.clear();
    timerState = { isRunning: false, startTime: null, elapsedTime: 0 };
    updateTimerDisplay();
    updateUI();
    loadEntries();
  });

  updateTimerDisplay();
  loadEntries();
});
