chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.timerState) {
    const newState = changes.timerState.newValue;
    if (newState) {
      // Timer is running or paused
    } else {
      // Timer stopped
    }
  }
});