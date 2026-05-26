document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const stopBtn = document.getElementById('stop');
  const timerDisplay = document.getElementById('timer');
  const manualForm = document.getElementById('manualForm');
  const projectInput = document.getElementById('project');
  const dateInput = document.getElementById('date');
  const durationInput = document.getElementById('duration');
  const notesInput = document.getElementById('notes');
  const exportBtn = document.getElementById('export');
  const entriesList = document.getElementById('entriesList');
  const todaySummary = document.getElementById('todaySummary');

  let timerState = { running: false, startTime: null };

  chrome.storage.local.get('localTrackTimer', (data) => {
    if (data.localTrackTimer) {
      timerState = data.localTrackTimer;
      updateTimerDisplay();
    }
  });

  function updateTimerDisplay() {
    if (timerState.running) {
      const now = Date.now();
      const elapsed = now - timerState.startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      timerDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timerDisplay.textContent = '00:00:00';
    }
  }

  startBtn.addEventListener('click', () => {
    timerState.running = true;
    timerState.startTime = Date.now();
    chrome.storage.local.set({ localTrackTimer: timerState }, () => {
      updateTimerDisplay();
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    });
  });

  pauseBtn.addEventListener('click', () => {
    timerState.running = false;
    chrome.storage.local.set({ localTrackTimer: timerState }, () => {
      updateTimerDisplay();
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    });
  });

  stopBtn.addEventListener('click', () => {
    const now = Date.now();
    const elapsed = now - timerState.startTime;
    const entry = {
      id: Date.now(),
      project: 'Timer',
      date: new Date().toISOString().split('T')[0],
      startTime: timerState.startTime,
      endTime: now,
      duration: elapsed,
      notes: 'Auto-tracked via timer'
    };
    saveEntry(entry);
    timerState = { running: false, startTime: null };
    chrome.storage.local.set({ localTrackTimer: timerState }, () => {
      updateTimerDisplay();
      loadEntries();
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
    });
  });

  manualForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = projectInput.value;
    const date = dateInput.value;
    const duration = durationInput.value;
    const notes = notesInput.value;

    if (!project || !date || !duration) {
      alert('Please fill in Project, Date, and Duration.');
      return;
    }

    const [h, m] = duration.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) {
      alert('Invalid duration format. Use HH:MM.');
      return;
    }

    const entry = {
      id: Date.now(),
      project: project,
      date: date,
      startTime: null,
      endTime: null,
      duration: (h * 60 + m) * 60000,
      notes: notes
    };
    saveEntry(entry);
    manualForm.reset();
    loadEntries();
  });

  function saveEntry(entry) {
    chrome.storage.local.get('localTrackEntries', (data) => {
      const entries = data.localTrackEntries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ localTrackEntries: entries });
    });
  }

  function loadEntries() {
    chrome.storage.local.get('localTrackEntries', (data) => {
      const entries = data.localTrackEntries || [];
      entriesList.innerHTML = '';
      let todayTotal = 0;
      const today = new Date().toISOString().split('T')[0];

      entries.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.project} - ${entry.date} (${(entry.duration / 60000).toFixed(2)}h) - ${entry.notes || ''}`;
        entriesList.appendChild(li);

        if (entry.date === today) {
          todayTotal += entry.duration;
        }
      });

      todaySummary.textContent = `Today's Summary: ${(todayTotal / 3600000).toFixed(2)} hours`;
    });
  }

  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get('localTrackEntries', (data) => {
      const entries = data.localTrackEntries || [];
      if (entries.length === 0) {
        alert('No entries to export.');
        return;
      }

      const jsonStr = JSON.stringify(entries, null, 2);
      const csvStr = entries.map(e => `${e.id},${e.project},${e.date},${(e.duration / 60000).toFixed(2)},${e.notes}`).join('\n');

      const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
      const csvBlob = new Blob([csvStr], { type: 'text/csv' });

      const jsonUrl = URL.createObjectURL(jsonBlob);
      const csvUrl = URL.createObjectURL(csvBlob);

      const a1 = document.createElement('a');
      a1.href = jsonUrl;
      a1.download = 'localtrack_export.json';
      a1.click();

      const a2 = document.createElement('a');
      a2.href = csvUrl;
      a2.download = 'localtrack_export.csv';
      a2.click();

      URL.revokeObjectURL(jsonUrl);
      URL.revokeObjectURL(csvUrl);
    });
  });

  loadEntries();
});