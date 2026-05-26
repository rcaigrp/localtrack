// background.js - Service Worker
// Handles persistent state logic if needed, though most state is in popup.js storage

chrome.storage.local.onChanged.addListener((changes, namespace) => {
  // Listen for changes if needed for cross-tab sync (not required for local-only)
});

// Keep service worker alive? MV3 is ephemeral. 
// We rely on storage for persistence.
