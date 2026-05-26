document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const stopBtn = document.getElementById('stop');
  const entryForm = document.getElementById('entry-form');
  const entriesList = document.getElementById('entries');

  let timerInterval;
  let timerState = { running: false, startTime: null, elapsedTime: 0 };

  // Load timer state
  chrome.storage.local.get('timerState', (data) => {
    if (data.timerState) {
      timerState = data.timerState;
      if (timerState.running) {
        startTimer();
      }
    }
  });

  // Load entries
  chrome.storage.local.get('entries', (data) => {
    if (data.entries) {
      renderEntries(data.entries);
    }
  });

  function startTimer() {
    timerState.running = true;
    timerState.startTime = Date.now() - timerState.elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
    chrome.storage.local.set({ timerState });
    startBtn.disabled = true;
    pauseBtn.disabled = false;
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    timerState.running = false;
    timerState.elapsedTime = Date.now() - timerState.startTime;
    chrome.storage.local.set({ timerState });
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerState = { running: false, startTime: null, elapsedTime: 0 };
    chrome.storage.local.set({ timerState });
    timerDisplay.textContent = '00:00:00';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function updateTimer() {
    const now = Date.now();
    const elapsed = now - timerState.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = document.getElementById('project').value;
    const date = document.getElementById('date').value;
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const notes = document.getElementById('notes').value;
    const duration = hours + minutes / 60;

    const entry = {
      id: Date.now().toString(),
      project,
      date,
      duration,
      notes,
      createdAt: new Date().toISOString()
    };

    chrome.storage.local.get('entries', (data) => {
      const entries = data.entries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ entries });
      renderEntries(entries);
      entryForm.reset();
    });
  });

  function renderEntries(entries) {
    entriesList.innerHTML = '';
    entries.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} (${entry.date}) - ${entry.duration}h - ${entry.notes}`;
      entriesList.appendChild(li);
    });
  }

  document.getElementById('export-json').addEventListener('click', () => {
    chrome.storage.local.get('entries', (data) => {
      const blob = new Blob([JSON.stringify(data.entries, null, 2)]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById('export-csv').addEventListener('click', () => {
    chrome.storage.local.get('entries', (data) => {
      const entries = data.entries || [];
      let csv = 'Project,Date,Duration,Notes\n';
      entries.forEach(entry => {
        csv += `${entry.project},${entry.date},${entry.duration},${entry.notes}\n`;
      });
      const blob = new Blob([csv]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById('clear').addEventListener('click', () => {
    chrome.storage.local.set({ entries: [], timerState: { running: false, startTime: null, elapsedTime: 0 } });
    timerDisplay.textContent = '00:00:00';
    entriesList.innerHTML = '';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  });
});
