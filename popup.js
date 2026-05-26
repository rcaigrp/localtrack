document.addEventListener('DOMContentLoaded', () => {
  const timerState = { running: false, startTime: null };
  const entryList = [];
  let timerInterval = null;

  const els = {
    elapsed: document.getElementById('elapsed'),
    start: document.getElementById('start'),
    pause: document.getElementById('pause'),
    stop: document.getElementById('stop'),
    form: document.getElementById('manual-form'),
    todayTotal: document.getElementById('today-total'),
    entryList: document.getElementById('entry-list'),
    exportJson: document.getElementById('export-json'),
    exportCsv: document.getElementById('export-csv'),
    clear: document.getElementById('clear-storage')
  };

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    if (timerState.running && timerState.startTime) {
      const now = Date.now();
      const elapsed = now - timerState.startTime;
      els.elapsed.textContent = formatTime(elapsed);
    } else {
      els.elapsed.textContent = '00:00:00';
    }
  }

  function saveState() {
    chrome.storage.local.set({ timerState });
  }

  function loadState() {
    chrome.storage.local.get(['timerState', 'entries'], (data) => {
      if (data.timerState) {
        timerState.running = data.timerState.running;
        timerState.startTime = data.timerState.startTime;
        if (timerState.running) {
          timerInterval = setInterval(updateTimerDisplay, 1000);
        }
      }
      if (data.entries) {
        entryList.length = 0;
        entryList.push(...data.entries);
        renderEntries();
      }
      updateTimerDisplay();
    });
  }

  els.start.addEventListener('click', () => {
    if (!timerState.startTime) {
      timerState.startTime = Date.now();
    }
    timerState.running = true;
    saveState();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    els.start.disabled = true;
    els.pause.disabled = false;
  });

  els.pause.addEventListener('click', () => {
    timerState.running = false;
    saveState();
    clearInterval(timerInterval);
    els.start.disabled = false;
    els.pause.disabled = true;
  });

  els.stop.addEventListener('click', () => {
    if (timerState.startTime) {
      const endTime = Date.now();
      const duration = endTime - timerState.startTime;
      const entry = {
        id: Date.now().toString(),
        project: 'Manual',
        date: new Date().toISOString().split('T')[0],
        startTime: new Date(timerState.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: duration,
        notes: ''
      };
      entryList.push(entry);
      chrome.storage.local.set({ entries: entryList });
      renderEntries();
    }
    timerState.running = false;
    timerState.startTime = null;
    clearInterval(timerInterval);
    saveState();
    els.elapsed.textContent = '00:00:00';
    els.start.disabled = false;
    els.pause.disabled = true;
  });

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = document.getElementById('project-name').value;
    const date = document.getElementById('entry-date').value;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;
    const notes = document.getElementById('notes').value;
    const duration = (hours * 60 + minutes) * 60 * 1000;

    const entry = {
      id: Date.now().toString(),
      project,
      date,
      startTime: new Date(date).toISOString(),
      endTime: new Date(new Date(date).getTime() + duration).toISOString(),
      duration,
      notes
    };
    entryList.push(entry);
    chrome.storage.local.set({ entries: entryList });
    renderEntries();
    els.form.reset();
  });

  function renderEntries() {
    els.entryList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    let todayMs = 0;
    entryList.slice().reverse().forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.project} - ${entry.duration / 1000 / 60 / 60}h (${entry.date})`;
      els.entryList.appendChild(li);
      if (entry.date === today) {
        todayMs += entry.duration;
      }
    });
    els.todayTotal.textContent = `Today: ${(todayMs / 1000 / 60 / 60).toFixed(2)}h`;
  }

  els.exportJson.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const blob = new Blob([JSON.stringify(data.entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  els.exportCsv.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const csv = [
        ['ID', 'Project', 'Date', 'Start', 'End', 'Duration (ms)', 'Notes'],
        ...data.entries.map(e => [e.id, e.project, e.date, e.startTime, e.endTime, e.duration, e.notes])
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  els.clear.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      loadState();
    });
  });

  loadState();
});