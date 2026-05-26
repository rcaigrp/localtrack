let timerState = { isRunning: false, startTime: null, elapsedTime: 0 };

chrome.storage.local.get('timerState', (data) => {
  if (data.timerState) {
    timerState = data.timerState;
    if (timerState.isRunning) {
      const now = Date.now();
      const elapsed = now - timerState.startTime;
      timerState.elapsedTime = timerState.elapsedTime + elapsed;
      timerState.startTime = now;
    }
  }
});

chrome.setInterval(() => {
  if (timerState.isRunning) {
    chrome.storage.local.set({ timerState });
  }
}, 1000);

function startTimer() {
  timerState = { isRunning: true, startTime: Date.now(), elapsedTime: 0 };
  chrome.storage.local.set({ timerState });
}

function pauseTimer() {
  if (timerState.isRunning) {
    const now = Date.now();
    timerState.elapsedTime += now - timerState.startTime;
    timerState.isRunning = false;
    chrome.storage.local.set({ timerState });
  }
}

function resumeTimer() {
  if (!timerState.isRunning) {
    timerState.startTime = Date.now();
    timerState.isRunning = true;
    chrome.storage.local.set({ timerState });
  }
}

function stopTimer() {
  timerState.isRunning = false;
  timerState.startTime = null;
  timerState.elapsedTime = 0;
  chrome.storage.local.set({ timerState });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.timerState) {
    timerState = changes.timerState.newValue;
  }
});
