chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.timerState) {
    console.log('Timer state updated:', changes.timerState.newValue);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTimerState') {
    chrome.storage.local.get('timerState', (data) => {
      sendResponse(data.timerState);
    });
    return true;
  }
});

