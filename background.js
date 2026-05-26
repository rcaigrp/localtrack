// Service worker for persistent timer state
// Note: Timer state is stored in chrome.storage.local to survive popup close.

class TimerState {
    constructor() {
        this.running = false;
        this.startTime = null;
        this.elapsedTime = 0;
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['timerState', 'entries'], (data) => {
        if (!data.timerState) {
            chrome.storage.local.set({ timerState: new TimerState() });
        }
    });
});