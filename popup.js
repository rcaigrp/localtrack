document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const stopBtn = document.getElementById('stop');
  const exportBtn = document.getElementById('export');

  function updateTimerDisplay() {
    chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
      if (state) {
        // Update UI with state
      }
    });
  }

  startBtn.addEventListener('click', () => chrome.runtime.sendMessage({ action: 'start' }));
  pauseBtn.addEventListener('click', () => chrome.runtime.sendMessage({ action: 'pause' }));
  stopBtn.addEventListener('click', () => chrome.runtime.sendMessage({ action: 'stop' }));

  const form = document.getElementById('manual-entry');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const project = document.getElementById('project').value;
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('notes').value;

    const entry = {
      id: Date.now(),
      project,
      date: new Date().toISOString().split('T')[0],
      duration,
      notes,
      startTime: null,
      endTime: null,
      isManual: true
    };

    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      entries.push(entry);
      chrome.storage.local.set({ entries });
    });
  });

  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get(['entries'], (data) => {
      const entries = data.entries || [];
      
      const jsonBlob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = jsonUrl;
      a.download = 'localtrack_entries.json';
      a.click();

      const csvContent = entries.map(e => `${e.project},${e.duration},${e.notes}`).join('\n');
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const b = document.createElement('a');
      b.href = csvUrl;
      b.download = 'localtrack_entries.csv';
      b.click();
    });
  });
});