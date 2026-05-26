// Core logic for timer, manual entry, storage, export
const state = {
  running: false,
  startTime: null,
  elapsed: 0,
  intervalId: null
};

// Load state from storage
chrome.storage.local.get(['timerState', 'entries'], (data) => {
  if (data.timerState) {
    state.running = data.timerState.running;
    state.startTime = data.timerState.startTime;
    state.elapsed = data.timerState.elapsed;
    if (state.running) {
      const now = Date.now();
      const diff = now - state.startTime;
      state.elapsed += diff;
      state.startTime = now;
      startTimerInterval();
    }
  }
  renderEntries(data.entries || []);
});

function saveState() {
  chrome.storage.local.set({ timerState: state });
}

function startTimerInterval() {
  if (state.intervalId) clearInterval(state.intervalId);
  state.intervalId = setInterval(() => {
    state.elapsed += 1000;
    updateTimerDisplay();
  }, 1000);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const totalMs = state.elapsed;
  const h = Math.floor(totalMs / 3600000);
  const m = Math.floor((totalMs % 3600000) / 60000);
  const s = Math.floor((totalMs % 60000) / 1000);
  document.getElementById('timer-display').textContent = 
    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

document.getElementById('start-btn').addEventListener('click', () => {
  state.running = true;
  state.startTime = Date.now();
  saveState();
  startTimerInterval();
});

document.getElementById('pause-btn').addEventListener('click', () => {
  state.running = false;
  saveState();
  if (state.intervalId) clearInterval(state.intervalId);
});

document.getElementById('stop-btn').addEventListener('click', () => {
  state.running = false;
  if (state.intervalId) clearInterval(state.intervalId);
  const entry = {
    id: Date.now(),
    project: 'Timer',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date(state.startTime).toISOString(),
    endTime: new Date().toISOString(),
    duration: state.elapsed,
    notes: 'Timer session'
  };
  chrome.storage.local.get(['entries'], (data) => {
    const entries = data.entries || [];
    entries.push(entry);
    chrome.storage.local.set({ entries });
    renderEntries(entries);
  });
  state.elapsed = 0;
  state.startTime = null;
  updateTimerDisplay();
  saveState();
});

// Manual Entry
document.getElementById('manual-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const project = document.getElementById('project-name').value;
  const date = document.getElementById('entry-date').value;
  const durationStr = document.getElementById('duration').value;
  const notes = document.getElementById('notes').value;
  
  const [h, m] = durationStr.split(':').map(Number);
  const durationMs = (h || 0) * 60 * 60 * 1000 + (m || 0) * 60 * 1000;
  
  const entry = {
    id: Date.now(),
    project,
    date,
    startTime: null,
    endTime: null,
    duration: durationMs,
    notes
  };
  
  chrome.storage.local.get(['entries'], (data) => {
    const entries = data.entries || [];
    entries.push(entry);
    chrome.storage.local.set({ entries });
    renderEntries(entries);
  });
});

function renderEntries(entries) {
  const list = document.getElementById('entries-list');
  list.innerHTML = '';
  const recent = entries.slice(-5).reverse();
  recent.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.project} (${e.date}) - ${(e.duration / 60000).toFixed(2)}m`;
    list.appendChild(li);
  });
}

// Export
document.getElementById('export-json').addEventListener('click', () => {
  chrome.storage.local.get(['entries'], (data) => {
    const blob = new Blob([JSON.stringify(data.entries, null, 2)]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localtrack-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

document.getElementById('export-csv').addEventListener('click', () => {
  chrome.storage.local.get(['entries'], (data) => {
    const entries = data.entries || [];
    const csv = entries.map(e => 
      `${e.project},${e.date},${(e.duration/60000).toFixed(2)},"${e.notes}"`
    ).join('\n');
    const header = 'Project,Date,Duration (min),Notes\n';
    const blob = new Blob([header + csv]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localtrack-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

// Clear Data
document.getElementById('clear-data').addEventListener('click', () => {
  chrome.storage.local.clear(() => {
    renderEntries([]);
    state.elapsed = 0;
    state.startTime = null;
    state.running = false;
    updateTimerDisplay();
  });
});
