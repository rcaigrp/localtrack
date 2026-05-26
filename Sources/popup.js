document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('entryForm');
  const projectInput = document.getElementById('projectName');
  const timeInput = document.getElementById('timeSpent');
  const saveBtn = document.getElementById('saveEntry');
  const entriesList = document.getElementById('entriesList');

  // Load saved entries on popup open
  loadEntries();

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const project = projectInput.value.trim();
    const time = timeInput.value.trim();

    if (project && time) {
      saveEntry(project, time);
      projectInput.value = '';
      timeInput.value = '';
      loadEntries(); // Refresh display after saving
    }
  });

  function saveEntry(project, time) {
    chrome.storage.local.get(['entries'], function(result) {
      const entries = result.entries || [];
      const newEntry = {
        project: project,
        time: time,
        timestamp: Date.now()
      };
      entries.push(newEntry);
      chrome.storage.local.set({entries: entries});
    });
  }

  function loadEntries() {
    chrome.storage.local.get(['entries'], function(result) {
      const entries = result.entries || [];
      displayEntries(entries);
    });
  }

  function displayEntries(entries) {
    entriesList.innerHTML = '';
    if (entries.length === 0) {
      entriesList.innerHTML = '<li>No entries yet</li>';
      return;
    }
    
    // Sort by timestamp descending (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp);
    
    entries.forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${entry.project}</strong> - ${entry.time} hours`;
      entriesList.appendChild(li);
    });
  }
});