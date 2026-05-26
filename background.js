chrome.storage.local.get(['timerState'], (data) => {
  if (data.timerState) {
    chrome.runtime.sendMessage({ type: 'restoreTimer', state: data.timerState });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'saveTimerState') {
    chrome.storage.local.set({ timerState: request.state });
  }
});
