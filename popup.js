document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const addEntryBtn = document.getElementById('add-entry-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const entryList = document.getElementById('entry-list');
  const timerDisplay = document.getElementById('timer-display');

  let intervalId = null;

  function updateTimerDisplay() {
    chrome.storage.local.get('timerState', (data) => {
      let state = data.timerState || { running: false, startTime: null };
      let display = "00:00:00";
      if (state.running && state.startTime) {
        let elapsed = Date.now() - state.startTime;
        let hours = Math.floor(elapsed / 3600000);
        let minutes = Math.floor((elapsed % 3600000) / 60000);
        let seconds = Math.floor((elapsed % 60000) / 1000);
        display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
      timerDisplay.textContent = display;
    });
  }

  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleTimer', state: 'start' });
    intervalId = setInterval(updateTimerDisplay, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    chrome.storage.local.get('timerState', (data) => {
      let state = data.timerState || { running: false, startTime: null };
      if (state.running) {
        state.running = false;
        chrome.storage.local.set({ timerState: state });
      }
    });
    clearInterval(intervalId);
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleTimer', state: 'stop' });
    clearInterval(intervalId);
    updateTimerDisplay();
  });

  addEntryBtn.addEventListener('click', () => {
    let projectName = document.getElementById('project-name').value;
    let date = document.getElementById('entry-date').value;
    let hours = document.getElementById('hours').value;
    let minutes = document.getElementById('minutes').value;
    let notes = document.getElementById('notes').value;

    if (!projectName || !date || hours === '' || minutes === '') {
      alert('Please fill in all required fields.');
      return;
    }

    let duration = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;
    let entry = { id: Date.now(), project: projectName, date: date, duration: duration, notes: notes };

    chrome.storage.local.get('entries', (data) => {
      let entries = data.entries || [];
      entries.unshift(entry);
      chrome.storage.local.set({ entries: entries });
      renderEntries();
    });
  });

  exportJsonBtn.addEventListener('click', () => {
    chrome.storage.local.get('entries', (data) => {
      let entries = data.entries || [];
      let json = JSON.stringify(entries, null, 2);
      let blob = new Blob([json], { type: 'application/json' });
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    chrome.storage.local.get('entries', (data) => {
      let entries = data.entries || [];
      let csv = 'Project,Date,Duration (h),Notes\n';
      entries.forEach(e => {
        csv += `${e.project},${e.date},${e.duration},${e.notes}\n`;
      });
      let blob = new Blob([csv], { type: 'text/csv' });
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = 'localtrack_entries.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  function renderEntries() {
    chrome.storage.local.get('entries', (data) => {
      let entries = data.entries || [];
      entryList.innerHTML = '';
      entries.forEach(e => {
        let li = document.createElement('li');
        li.textContent = `${e.project} (${e.date}) - ${e.duration}h`;
        entryList.appendChild(li);
      });
    });
  }

  renderEntries();
  updateTimerDisplay();
});
