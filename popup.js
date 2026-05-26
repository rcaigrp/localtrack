document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer-display');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const stopBtn = document.getElementById('stop');
  const saveEntryBtn = document.getElementById('save-entry');
  const exportJsonBtn = document.getElementById('export-json');
  const exportCsvBtn = document.getElementById('export-csv');
  const clearStorageBtn = document.getElementById('clear-storage');

  let timerInterval;
  let currentState = { status: 'stopped', startTime: 0, elapsed: 0 };

  function updateTimerDisplay() {
    const now = Date.now();
    let totalMs = currentState.elapsed;
    if (currentState.status === 'running') {
      totalMs += now - currentState.startTime;
    }
    const seconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function loadState() {
    chrome.storage.local.get('timerState', (data) => {
      currentState = data.timerState || { status: 'stopped', startTime: 0, elapsed: 0 };
      updateTimerDisplay();
    });
  }

  startBtn.addEventListener('click', () => {
    if (currentState.status === 'stopped' || currentState.status === 'paused') {
      currentState.status = 'running';
      currentState.startTime = Date.now();
      chrome.storage.local.set({ timerState: currentState });
      timerInterval = setInterval(updateTimerDisplay, 1000);
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (currentState.status === 'running') {
      currentState.status = 'paused';
      currentState.elapsed += Date.now() - currentState.startTime;
      chrome.storage.local.set({ timerState: currentState });
      clearInterval(timerInterval);
    }
  });

  stopBtn.addEventListener('click', () => {
    if (currentState.status === 'running' || currentState.status === 'paused') {
      clearInterval(timerInterval);
      const endTime = Date.now();
      const totalTime = currentState.elapsed + (currentState.status === 'running' ? endTime - currentState.startTime : 0);
      const entry = {
        id: Date.now(),
        project: 'Default',
        date: new Date().toISOString().split('T')[0],
        startTime: new Date(currentState.startTime).toLocaleTimeString(),
        endTime: new Date(endTime).toLocaleTimeString(),
        duration: totalTime / 1000,
        notes: ''
      };
      chrome.storage.local.get(['entries'], (data) => {
        const entries = data.entries || [];
        entries.push(entry);
        chrome.storage.local.set({ entries: entries });
      });
      currentState = { status: 'stopped', startTime: 0, elapsed: 0 };
      chrome.storage.local.set({ timerState: currentState });
      updateTimerDisplay();
    }
  });

  saveEntryBtn.addEventListener('click', () => {
    const projectName = document.getElementById('project-name').value;
    const date = document.getElementById('entry-date').value;
    const hours = parseInt(document.getElementById('duration-hours').value) || 0;
    const minutes = parseInt(document.getElementById('duration-minutes').value) || 0;
    const notes = document.getElementById('notes').value;

    if (!projectName || !date) {
      alert('Please enter Project Name and Date.');
      return;
    }

    const duration = hours * 3600 + minutes;
    const entry = {
      id: Date.now(),
      project: projectName,
      date: date,
      startTime: '',
      endTime: '',
      duration: duration,
      notes: notes
    };

    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.push(entry);
      chrome.storage.local.set({ entries: entries });
      loadEntries();
    });
  });

  function loadEntries() {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      const list = document.getElementById('entry-list');
      list.innerHTML = '';
      entries.slice(-10).reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.project} - ${entry.date} (${(entry.duration / 3600).toFixed(2)}h) - ${entry.notes}`;
        list.appendChild(li);
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
      const csv = entries.map(e => `${e.project},${e.date},${(e.duration / 3600).toFixed(2)},${e.notes}`).join('\n');
      const header = 'Project,Date,Duration (h),Notes\n';
      const blob = new Blob([header + csv], { type: 'text/csv' });
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
    chrome.storage.local.clear(() => {
      loadState();
      loadEntries();
      alert('Storage cleared.');
    });
  });

  loadState();
  loadEntries();
  timerInterval = setInterval(updateTimerDisplay, 1000);
});