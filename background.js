// Service worker for timer persistence
let timerState = {
  isRunning: false,
  startTime: null,
  totalElapsed: 0
};

chrome.storage.local.get(['timerState'], (data) => {
  if (data.timerState) {
    timerState = data.timerState;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    timerState.isRunning = true;
    timerState.startTime = Date.now();
    chrome.storage.local.set({ timerState: timerState });
  } else if (request.action === 'pause') {
    if (timerState.isRunning) {
      const elapsed = Date.now() - timerState.startTime;
      timerState.totalElapsed += elapsed;
      timerState.isRunning = false;
      timerState.startTime = null;
      chrome.storage.local.set({ timerState: timerState });
    }
  } else if (request.action === 'resume') {
    if (!timerState.isRunning) {
      timerState.isRunning = true;
      timerState.startTime = Date.now();
      chrome.storage.local.set({ timerState: timerState });
    }
  } else if (request.action === 'stop') {
    if (timerState.isRunning) {
      const elapsed = Date.now() - timerState.startTime;
      timerState.totalElapsed += elapsed;
      timerState.isRunning = false;
      timerState.startTime = null;
      chrome.storage.local.set({ timerState: timerState });
    }
  }
});