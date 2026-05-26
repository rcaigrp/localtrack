document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const entryForm = document.getElementById('entry-form');
  const entriesList = document.getElementById('entries-list');
  const todaySummary = document.getElementById('today-summary');
  const clearBtn = document.getElementById('clear-btn');
  const exportJsonBtn = document.getElementById('export-json');
  const exportCsvBtn = document.getElementById('export-csv');

  let timerInterval = null;
  let timerState = { running: false, startTime: null };

  chrome.storage.local.get(['timer', 'entries'], (data) => {
    if (data.timer && data.timer.running) {
      timerState = data.timer;
      startTimer();
      updateTimerDisplay();
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      startBtn.disabled = true;
    }
    renderEntries(data.entries || []);
  });

  function startTimer() {
    if (!timerState.startTime) {
      timerState.startTime = Date.now();
    }
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }

  function updateTimerDisplay() {
    const elapsed = Date.now() - timerState.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  startBtn.addEventListener('click', () => {
    timerState = { running: true, startTime: Date.now() };
    saveTimerState();
    startTimer();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
  });

  pauseBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerState.running = false;
    saveTimerState();
    pauseBtn.disabled = true;
    startBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    const duration = Date.now() - timerState.startTime;
    const entry = {
      id: Date.now(),
      project: 'Timer',
      date: new Date().toISOString().split('T')[0],
      startTime: timerState.startTime,
      endTime: Date.now(),
      duration: duration / 3600000,
      notes: 'Auto-timed session'
    };
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ entries });
      renderEntries(entries);
      todaySummary.textContent = `Today: ${formatDuration(duration / 3600000)}`;
    });
    timerState = { running: false, startTime: null };
    saveTimerState();
    timerDisplay.textContent = '00:00:00';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
  });

  function saveTimerState() {
    chrome.storage.local.set({ timer: timerState });
  }

  function formatDuration(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
  }

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value.trim();
    const date = document.getElementById('entry-date').value;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;
    const notes = document.getElementById('notes').value.trim();

    if (!projectName || !date) {
      alert('Please enter a project name and date.');
      return;
    }

    const duration = hours + minutes / 60;
    const entry = {
      id: Date.now(),
      project: projectName,
      date: date,
      startTime: null,
      endTime: null,
      duration: duration,
      notes: notes
    };

    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ entries });
      renderEntries(entries);
      updateTodaySummary(entries);
      entryForm.reset();
    });
  });

  function renderEntries(entries) {
    entriesList.innerHTML = '';
    const recent = entries.slice(0, 5);
    recent.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} (${entry.date}) - ${formatDuration(entry.duration)} ${entry.notes ? `| ${entry.notes}` : ''}`;
      entriesList.appendChild(li);
    });
    updateTodaySummary(entries);
  }

  function updateTodaySummary(entries) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.date === today);
    const total = todayEntries.reduce((sum, e) => sum + e.duration, 0);
    todaySummary.textContent = `Today: ${formatDuration(total)}`;
  }

  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all entries?')) {
      chrome.storage.local.set({ entries: [] });
      renderEntries([]);
    }
  });

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      const json = JSON.stringify(entries, null, 2);
      downloadFile(json, 'localtrack-export.json', 'application/json');
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      const csv = entries.map(e => 
        `${e.project},${e.date},${e.duration.toFixed(2)},${e.notes.replace(/,/g, '')}`
      ).join('\n');
      const header = 'Project,Date,Duration (h),Notes\n';
      downloadFile(header + csv, 'localtrack-export.csv', 'text/csv');
    });
  });

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});