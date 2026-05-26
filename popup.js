document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const entryForm = document.getElementById('entry-form');
  const entriesList = document.getElementById('entries-list');
  const exportJsonBtn = document.getElementById('export-json');
  const exportCsvBtn = document.getElementById('export-csv');
  const clearBtn = document.getElementById('clear-btn');

  let timerInterval;
  let timerState = { running: false, startTime: null };

  chrome.storage.local.get(['entries', 'timerState'], (data) => {
    if (data.timerState) {
      timerState = data.timerState;
      if (timerState.running) {
        resumeTimer();
      }
    }
    renderEntries(data.entries || []);
  });

  function resumeTimer() {
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }

  function updateTimerDisplay() {
    const now = Date.now();
    const elapsed = now - timerState.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  startBtn.addEventListener('click', () => {
    if (!timerState.running) {
      timerState = { running: true, startTime: Date.now() };
      chrome.storage.local.set({ timerState });
      resumeTimer();
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (timerState.running) {
      timerState = { running: false };
      chrome.storage.local.set({ timerState });
      clearInterval(timerInterval);
    }
  });

  stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerState = { running: false, startTime: null };
    chrome.storage.local.set({ timerState });
    timerDisplay.textContent = '00:00:00';
  });

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    const date = document.getElementById('entry-date').value;
    const hours = parseFloat(document.getElementById('duration-hours').value);
    const minutes = parseInt(document.getElementById('duration-minutes').value) || 0;
    const notes = document.getElementById('notes').value;
    const duration = hours + minutes / 60;
    const entry = {
      id: Date.now(),
      project: projectName,
      date: date,
      duration: duration,
      notes: notes
    };
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ entries });
      renderEntries(entries);
    });
    entryForm.reset();
  });

  function renderEntries(entries) {
    entriesList.innerHTML = '';
    entries.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} (${entry.date}) - ${entry.duration}h`;
      entriesList.appendChild(li);
    });
  }

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const blob = new Blob([JSON.stringify(data.entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.json';
      a.click();
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const csv = data.entries.map(e => `${e.project},${e.date},${e.duration},${e.notes}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      a.click();
    });
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.clear();
    renderEntries([]);
    timerDisplay.textContent = '00:00:00';
  });
});