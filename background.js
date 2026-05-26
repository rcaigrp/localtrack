let timerState = { running: false, startTime: null };

chrome.storage.local.get('localTrackTimer', (data) => {
  if (data.localTrackTimer) {
    timerState = data.localTrackTimer;
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.localTrackTimer) {
    timerState = changes.localTrackTimer.newValue;
  }
});

setInterval(() => {
  if (timerState.running) {
    const now = Date.now();
    chrome.storage.local.set({ localTrackTimer: { running: true, startTime: timerState.startTime, elapsed: now - timerState.startTime } });
  }
}, 1000);