chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getTimerState') {
    chrome.storage.local.get('timerState', (data) => {
      sendResponse(data.timerState || null);
    });
    return true; // async response
  } else if (request.type === 'setTimerState') {
    chrome.storage.local.set({ timerState: request.timerState });
  }
});
