// Service worker for persistent timer state
// In MV3, the background script runs persistently.
// We use chrome.storage.local for state persistence across popup close/open.

chrome.storage.local.get(['timerState'], (data) => {
  if (data.timerState) {
    console.log('Background: Timer state recovered:', data.timerState);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'startTimer') {
    const now = Date.now();
    chrome.storage.local.set({ timerState: { status: 'running', startTime: now } });
    sendResponse({ success: true });
  }
});