document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const timerDisplay = document.getElementById('timer-display');
  const entryForm = document.getElementById('entry-form');
  const entriesList = document.getElementById('entries-list');
  const summary = document.getElementById('summary');
  const exportJsonBtn = document.getElementById('export-json');
  const exportCsvBtn = document.getElementById('export-csv');
  const clearStorageBtn = document.getElementById('clear-storage');

  let timerInterval = null;
  let timerState = {
    isRunning: false,
    startTime: null,
    elapsed: 0
  };

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function updateDisplay() {
    const totalSeconds = Math.floor(timerState.elapsed / 1000) + Math.floor((Date.now() - (timerState.isRunning && timerState.startTime ? timerState.startTime : Date.now())) / 1000);
    if (timerState.isRunning) {
      timerDisplay.textContent = formatTime(totalSeconds);
    } else {
      timerDisplay.textContent = formatTime(Math.floor(timerState.elapsed / 1000));
    }
  }

  function loadState() {
    chrome.storage.local.get('timerState', (data) => {
      if (data.timerState) {
        timerState = data.timerState;
        if (timerState.isRunning) {
          startTimer();
        }
      }
      updateDisplay();
    });
  }

  function saveState() {
    chrome.storage.local.set({ timerState });
  }

  function startTimer() {
    timerState.isRunning = true;
    timerState.startTime = Date.now();
    saveState();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    timerInterval = setInterval(updateDisplay, 1000);
  }

  function pauseTimer() {
    timerState.isRunning = false;
    timerState.elapsed += Date.now() - timerState.startTime;
    saveState();
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    updateDisplay();
  }

  function stopTimer() {
    timerState.isRunning = false;
    timerState.elapsed += Date.now() - timerState.startTime;
    saveState();
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    updateDisplay();
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = document.getElementById('project').value;
    const date = document.getElementById('date').value;
    const duration = parseInt(document.getElementById('duration').value);
    const notes = document.getElementById('notes').value;

    const entry = {
      id: Date.now().toString(),
      project,
      date,
      duration,
      notes
    };

    chrome.storage.local.get('entries', (data) => {
      const entries = data.entries || [];
      entries.push(entry);
      chrome.storage.local.set({ entries }, () => {
        loadEntries();
        entryForm.reset();
      });
    });
  });

  function loadEntries() {
    chrome.storage.local.get('entries', (data) => {
      const entries = data.entries || [];
      entriesList.innerHTML = '';
      let totalDuration = 0;
      entries.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.project} (${entry.date}) - ${entry.duration}m`;
        if (entry.notes) li.textContent += ` [${entry.notes}]`;
        entriesList.appendChild(li);
        totalDuration += entry.duration;
      });
      const totalHours = Math.floor(totalDuration / 60);
      const totalMinutes = totalDuration % 60;
      summary.textContent = `Total: ${totalHours}h ${totalMinutes}m`;
    });
  }

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get('entries', (data) => {
      const entries = data.entries || [];
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
    chrome.storage.local.get('entries', (data) => {
      const entries = data.entries || [];
      const csv = entries.map(e => `${e.project},${e.date},${e.duration},"${e.notes}"`).join('\n');
      const header = 'Project,Date,Duration(min),Notes\n';
      const blob = new Blob([header + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  clearStorageBtn.addEventListener('click', () => {
    chrome.storage.local.clear();
    timerState = { isRunning: false, startTime: null, elapsed: 0 };
    loadEntries();
    updateDisplay();
  });

  loadState();
  loadEntries();
});
