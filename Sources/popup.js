class Timer {
  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.timerId = null;
    
    // DOM elements
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.timeDisplay = document.getElementById('timeDisplay');
    
    this.init();
  }

  init() {
    // Load saved state
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const { startTime, elapsedTime, isRunning } = result.timerState;
        this.startTime = startTime;
        this.elapsedTime = elapsedTime;
        this.isRunning = isRunning;
        
        // Restore UI state
        if (this.isRunning) {
          this.startBtn.disabled = true;
          this.pauseBtn.disabled = false;
          this.stopBtn.disabled = false;
          this.startTimer();
        } else {
          this.updateDisplay();
        }
      } else {
        this.updateDisplay();
      }
    });

    // Set up event listeners
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.stopBtn.addEventListener('click', () => this.stopTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
  }

  startTimer() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now() - this.elapsedTime;
    
    // Update UI
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;
    this.stopBtn.disabled = false;
    
    // Save state
    this.saveState();
    
    // Start the timer loop
    this.tick();
  }

  pauseTimer() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Update UI
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.stopBtn.disabled = false;
    
    // Save state
    this.saveState();
  }

  stopTimer() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.elapsedTime = 0;
    
    // Update UI
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.stopBtn.disabled = true;
    
    // Save state
    this.saveState();
    this.updateDisplay();
  }

  resetTimer() {
    this.isRunning = false;
    this.elapsedTime = 0;
    this.startTime = 0;
    
    // Update UI
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.stopBtn.disabled = true;
    
    // Save state
    this.saveState();
    this.updateDisplay();
  }

  tick() {
    if (!this.isRunning) return;
    
    const now = Date.now();
    this.elapsedTime = now - this.startTime;
    this.updateDisplay();
    
    // Use requestAnimationFrame for smoother updates
    this.timerId = requestAnimationFrame(() => this.tick());
  }

  updateDisplay() {
    const hours = Math.floor(this.elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((this.elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((this.elapsedTime % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
    
    this.timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }

  saveState() {
    const state = {
      startTime: this.startTime,
      elapsedTime: this.elapsedTime,
      isRunning: this.isRunning
    };
    
    chrome.storage.local.set({ timerState: state }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving timer state:', chrome.runtime.lastError);
      }
    });
  }
}

// Initialize the timer when the popup loads
window.addEventListener('load', () => {
  new Timer();
});