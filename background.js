// background.js
// Service worker to persist timer state across popup closures and browser restarts.

let timerState = {
    isRunning: false,
    startTime: null,
    totalDuration: 0 // in milliseconds
};

// Load state from storage on startup
chrome.storage.local.get(['timerState'], (data) => {
    if (data.timerState) {
        timerState = data.timerState;
    }
});

// Save state whenever it changes
chrome.storage.local.set({'timerState': timerState});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        timerState.isRunning = true;
        timerState.startTime = Date.now();
        timerState.totalDuration = 0;
        chrome.storage.local.set({'timerState': timerState});
        sendResponse({status: 'started'});
    } else if (request.action === 'pause') {
        if (timerState.isRunning) {
            timerState.totalDuration += Date.now() - timerState.startTime;
            timerState.isRunning = false;
            timerState.startTime = null;
            chrome.storage.local.set({'timerState': timerState});
        }
        sendResponse({status: 'paused'});
    } else if (request.action === 'stop') {
        if (timerState.isRunning) {
            timerState.totalDuration += Date.now() - timerState.startTime;
        }
        timerState.isRunning = false;
        timerState.startTime = null;
        chrome.storage.local.set({'timerState': timerState});
        sendResponse({status: 'stopped'});
    } else if (request.action === 'getStatus') {
        sendResponse(timerState);
    }
});