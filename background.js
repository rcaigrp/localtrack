// Service worker for persistent timer state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncState') {
    chrome.storage.local.set({ timerState: request.state });
  }
});
