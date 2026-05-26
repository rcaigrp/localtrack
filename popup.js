document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const stopBtn = document.getElementById('stop');
  const manualForm = document.getElementById('manual-form');
  const todaySummary = document.getElementById('today-summary');
  const recentEntries = document.getElementById('recent-entries');
  const exportJsonBtn = document.getElementById('export-json');
  const exportCsvBtn = document.getElementById('export-csv');

  let timerInterval;
  let state = { running: false, startTime: null, paused: false };

  chrome.storage.local.get(['timerState', 'entries'], (data) => {
    state = data.timerState || state;
    if (state.running) {
      timerDisplay.textContent = formatTime(Date.now() - state.startTime);
      startTimer();
    }
    renderEntries(data.entries || []);
    updateSummary(data.entries || []);
  });

  startBtn.addEventListener('click', () => {
    state.running = true;
    state.startTime = Date.now();
    state.paused = false;
    chrome.storage.local.set({ timerState: state });
    startTimer();
  });

  pauseBtn.addEventListener('click', () => {
    state.paused = true;
    state.running = false;
    chrome.storage.local.set({ timerState: state });
    clearInterval(timerInterval);
  });

  stopBtn.addEventListener('click', () => {
    state.running = false;
    state.paused = false;
    state.startTime = null;
    chrome.storage.local.set({ timerState: state });
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00:00';
  });

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (state.running) {
        timerDisplay.textContent = formatTime(Date.now() - state.startTime);
      }
    }, 1000);
  }

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  manualForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = document.getElementById('project').value;
    const date = document.getElementById('date').value;
    const duration = parseFloat(document.getElementById('duration').value);
    const notes = document.getElementById('notes').value;

    const newEntry = {
      id: Date.now().toString(),
      project,
      date,
      duration,
      notes,
      startTime: null,
      endTime: null
    };

    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.push(newEntry);
      chrome.storage.local.set({ entries });
      renderEntries(entries);
      updateSummary(entries);
      manualForm.reset();
    });
  });

  function renderEntries(entries) {
    recentEntries.innerHTML = '';
    entries.slice(-5).reverse().forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} (${entry.duration}h) - ${entry.date}`;
      recentEntries.appendChild(li);
    });
  }

  function updateSummary(entries) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.date === today);
    const total = todayEntries.reduce((sum, e) => sum + e.duration, 0);
    todaySummary.textContent = `Total: ${total.toFixed(2)} hours`;
  }

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const blob = new Blob([JSON.stringify(data.entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries;
      const csv = entries.map(e => `${e.project},${e.date},${e.duration},${e.notes}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  });
});