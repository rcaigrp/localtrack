// background.js
let timerState = {
  running: false,
  startTime: null,
  elapsed: 0
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    timerState.running = true;
    timerState.startTime = Date.now();
    timerState.elapsed = 0;
    sendResponse({ status: 'started', state: timerState });
  } else if (request.action === 'pauseTimer') {
    if (timerState.running) {
      const now = Date.now();
      timerState.elapsed += now - timerState.startTime;
      timerState.running = false;
      timerState.startTime = null;
      sendResponse({ status: 'paused', state: timerState });
    }
  } else if (request.action === 'resumeTimer') {
    if (!timerState.running) {
      timerState.running = true;
      timerState.startTime = Date.now();
      sendResponse({ status: 'resumed', state: timerState });
    }
  } else if (request.action === 'stopTimer') {
    let finalElapsed = timerState.elapsed;
    if (timerState.running) {
      finalElapsed += Date.now() - timerState.startTime;
    }
    timerState = { running: false, startTime: null, elapsed: 0 };
    sendResponse({ status: 'stopped', state: { ...timerState, totalElapsed: finalElapsed } });
  } else if (request.action === 'getState') {
    sendResponse(timerState);
  } else if (request.action === 'resetState') {
    timerState = { running: false, startTime: null, elapsed: 0 };
    sendResponse(timerState);
  }
});

// Restore state if needed (optional, storage handles persistence of entries)
// Timer state is ephemeral but we store it to handle browser restarts
chrome.storage.local.get(['timerState'], (data) => {
  if (data.timerState) {
    timerState = data.timerState;
    if (timerState.running) {
      // If browser restarted while running, we might need to handle this
      // For now, we assume it was paused or we let it run
      timerState.startTime = Date.now();
    }
  }
});

chrome.storage.local.set({ timerState: timerState });
