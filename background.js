chrome.runtime.onInstalled.addListener(() => {
  console.log('LocalTrack extension installed');
});

// Persistent timer state management
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let isRunning = false;

// Update timer in background
function updateTimer() {
  if (isRunning && startTime) {
    const now = Date.now();
    elapsedTime = now - startTime;
    
    // Store state in extension storage
    chrome.storage.local.set({
      timerState: {
        isRunning,
        startTime,
        elapsedTime
      }
    });
  }
}

// Start timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
    
    // Store state
    chrome.storage.local.set({
      timerState: {
        isRunning,
        startTime,
        elapsedTime
      }
    });
  }
}

// Pause timer
function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
    
    // Store state
    chrome.storage.local.set({
      timerState: {
        isRunning,
        startTime,
        elapsedTime
      }
    });
  }
}

// Stop timer
function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  elapsedTime = 0;
  
  // Store state
  chrome.storage.local.set({
    timerState: {
      isRunning,
      startTime: null,
      elapsedTime
    }
  });
}

// Initialize timer on extension start
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState && result.timerState.isRunning) {
      isRunning = true;
      startTime = result.timerState.startTime;
      elapsedTime = result.timerState.elapsedTime;
      timerInterval = setInterval(updateTimer, 1000);
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startTimer') {
    startTimer();
  } else if (message.action === 'pauseTimer') {
    pauseTimer();
  } else if (message.action === 'stopTimer') {
    stopTimer();
  }
});