// Background script for LocalTrack extension

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTimerState') {
    chrome.storage.local.get(['timerState'], (result) => {
      sendResponse({ timerState: result.timerState });
    });
    return true; // Keep message channel open for async response
  }
});
