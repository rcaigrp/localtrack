const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const stopButton = document.getElementById('stop');
const saveEntryButton = document.getElementById('saveEntry');

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;

// Save timer state to storage
function saveTimerState() {
    const timerData = {
        isRunning: isRunning,
        elapsedTime: elapsedTime,
        startTime: startTime
    };
    chrome.storage.local.set({timerData: timerData});
}

// Restore timer state from storage
function restoreTimerState() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['timerData'], (result) => {
            if (result.timerData) {
                const timerData = result.timerData;
                isRunning = timerData.isRunning;
                elapsedTime = timerData.elapsedTime;
                startTime = timerData.startTime;
                
                // Update display with restored time
                updateDisplay();
                
                if (isRunning) {
                    startTimer();
                }
            }
            resolve();
        });
    });
}

function updateDisplay() {
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 1000);
        
        saveTimerState();
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        saveTimerState();
    }
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    elapsedTime = 0;
    updateDisplay();
    saveTimerState();
}

// Initialize timer state on popup open
restoreTimerState().then(() => {
    // Timer state restored, UI ready
});

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
stopButton.addEventListener('click', stopTimer);

// Save state when popup closes (using pagehide event)
window.addEventListener('pagehide', saveTimerState);
