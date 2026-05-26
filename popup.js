const STORAGE_KEY = 'entries';

document.addEventListener('DOMContentLoaded', () => {
  loadEntries();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('save-btn').addEventListener('click', saveEntry);
  document.getElementById('export-json').addEventListener('click', exportJSON);
  document.getElementById('export-csv').addEventListener('click', exportCSV);
}

function saveEntry() {
  const project = document.getElementById('project').value;
  const date = document.getElementById('date').value;
  const duration = document.getElementById('duration').value;
  const notes = document.getElementById('notes').value;

  if (!project || !date || !duration) {
    alert('Please fill in all required fields.');
    return;
  }

  const entry = {
    id: Date.now(),
    project,
    date,
    duration,
    notes,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString()
  };

  chrome.storage.local.get(STORAGE_KEY, (data) => {
    let entries = data.entries || [];
    entries.push(entry);
    chrome.storage.local.set({ [STORAGE_KEY]: entries }, () => {
      loadEntries();
    });
  });
}

function loadEntries() {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const entries = data.entries || [];
    const list = document.getElementById('entries-list');
    list.innerHTML = '';
    entries.forEach(entry => {
      const div = document.createElement('div');
      div.textContent = `${entry.project} - ${entry.date} (${entry.duration}h)`;
      list.appendChild(div);
    });
  });
}

function exportJSON() {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const entries = data.entries || [];
    const json = JSON.stringify(entries);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'entries.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function exportCSV() {
  chrome.storage.local.get(STORAGE_KEY, (data) => {
    const entries = data.entries || [];
    const csv = entries.map(e => `${e.project},${e.date},${e.duration},${e.notes}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'entries.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}
