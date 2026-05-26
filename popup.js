document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initManualEntry();
  loadEntries();
  loadSummary();
});

function initTimer() {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const display = document.getElementById('timer-display');

  let intervalId = null;
  let timerState = { status: 'stopped', startTime: 0, elapsed: 0 };

  function updateDisplay() {
    const elapsed = Date.now() - timerState.startTime - timerState.elapsed;
    const total = timerState.elapsed + elapsed;
    const hours = Math.floor(total / 3600000);
    const minutes = Math.floor((total % 3600000) / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function loadState() {
    chrome.storage.local.get('timerState', (data) => {
      if (data.timerState) {
        timerState = data.timerState;
        if (timerState.status === 'running') {
          startTimer();
        } else {
          updateDisplay();
        }
      } else {
        timerState = { status: 'stopped', startTime: 0, elapsed: 0 };
      }
    });
  }

  function startTimer() {
    timerState.status = 'running';
    timerState.startTime = Date.now();
    chrome.storage.local.set({ timerState: timerState });
    intervalId = setInterval(updateDisplay, 1000);
    updateDisplay();
  }

  function pauseTimer() {
    if (timerState.status === 'running') {
      timerState.status = 'paused';
      timerState.elapsed += Date.now() - timerState.startTime;
      clearInterval(intervalId);
      chrome.storage.local.set({ timerState: timerState });
    }
  }

  function stopTimer() {
    if (timerState.status === 'running' || timerState.status === 'paused') {
      clearInterval(intervalId);
      if (timerState.status === 'running') {
        timerState.elapsed += Date.now() - timerState.startTime;
      }
      timerState.status = 'stopped';
      timerState.startTime = 0;
      chrome.storage.local.set({ timerState: timerState });
      updateDisplay();
    }
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  stopBtn.addEventListener('click', stopTimer);

  loadState();
}

function initManualEntry() {
  const form = document.getElementById('entry-form');
  const saveBtn = document.getElementById('save-entry-btn');

  saveBtn.addEventListener('click', async () => {
    const project = document.getElementById('project').value;
    const date = document.getElementById('date').value;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;
    const notes = document.getElementById('notes').value;

    if (!project || !date) {
      alert('Please enter a project name and date.');
      return;
    }

    const duration = hours + minutes / 60;
    const entry = {
      id: Date.now().toString(),
      project,
      date,
      duration,
      notes
    };

    try {
      const data = await chrome.storage.local.get('entries');
      const entries = data.entries || [];
      entries.push(entry);
      await chrome.storage.local.set({ entries: entries });
      loadEntries();
      loadSummary();
      form.reset();
    } catch (err) {
      console.error('Error saving entry:', err);
    }
  });
}

async function loadEntries() {
  const data = await chrome.storage.local.get('entries');
  const entries = data.entries || [];
  const list = document.getElementById('entries-list');
  list.innerHTML = '';
  entries.slice(-5).reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.project} - ${entry.date} (${entry.duration}h)`;
    list.appendChild(li);
  });
}

async function loadSummary() {
  const data = await chrome.storage.local.get('entries');
  const entries = data.entries || [];
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.date === today);
  const total = todayEntries.reduce((sum, e) => sum + e.duration, 0);
  document.getElementById('today-total').textContent = `${total.toFixed(2)} hours`;
}

document.getElementById('export-json-btn').addEventListener('click', () => {
  chrome.storage.local.get('entries', (data) => {
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

document.getElementById('export-csv-btn').addEventListener('click', () => {
  chrome.storage.local.get('entries', (data) => {
    const entries = data.entries || [];
    const csv = [
      ['id', 'project', 'date', 'duration', 'notes'],
      ...entries.map(e => [e.id, e.project, e.date, e.duration, e.notes])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
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

document.getElementById('clear-storage-btn').addEventListener('click', () => {
  chrome.storage.local.clear();
  loadEntries();
  loadSummary();
  alert('Storage cleared.');
});