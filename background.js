// background.js
// Service worker for persistent timer state

const STORAGE_KEY = 'localTrackEntries';
const TIMER_KEY = 'localTrackTimer';

chrome.storage.local.get((data) => {
  // Initialize storage if empty
  if (!data[STORAGE_KEY]) {
    chrome.storage.local.set({ [STORAGE_KEY]: [] });
  }
  if (!data[TIMER_KEY]) {
    chrome.storage.local.set({ [TIMER_KEY]: { status: 'stopped' } });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getTimerState') {
    chrome.storage.local.get(TIMER_KEY, (data) => {
      sendResponse(data[TIMER_KEY]);
    });
    return true;
  }
});