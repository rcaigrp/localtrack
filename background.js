chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.timerState) {
    // State persisted
  }
});