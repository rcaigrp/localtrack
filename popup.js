document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const timerDisplay = document.getElementById('timer-display');
    const manualForm = document.getElementById('manual-form');
    const exportBtn = document.getElementById('export-btn');
    const entriesList = document.getElementById('entries-list');

    let timerState = { running: false, startTime: null, elapsedTime: 0 };
    let entries = [];

    // Load from storage
    chrome.storage.local.get(['timerState', 'entries'], (data) => {
        if (data.timerState) timerState = data.timerState;
        if (data.entries) entries = data.entries;
        updateTimerDisplay();
        renderEntries();
        if (timerState.running) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'block';
            // Resume logic
            timerState.startTime = Date.now() - timerState.elapsedTime;
            timerState.intervalId = setInterval(updateTimerDisplay, 1000);
        } else {
            pauseBtn.style.display = 'none';
        }
    });

    function saveState() {
        chrome.storage.local.set({ timerState, entries });
    }

    function updateTimerDisplay() {
        if (timerState.running) {
            const now = Date.now();
            const elapsed = now - timerState.startTime + timerState.elapsedTime;
            const date = new Date(elapsed);
            const h = date.getUTCHours();
            const m = date.getUTCMinutes();
            const s = date.getUTCSeconds();
            timerDisplay.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
        }
    }

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    // Timer Buttons
    startBtn.addEventListener('click', () => {
        timerState.running = true;
        timerState.startTime = Date.now();
        timerState.elapsedTime = 0;
        timerState.intervalId = setInterval(updateTimerDisplay, 1000);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'block';
        stopBtn.style.display = 'block';
        saveState();
    });

    pauseBtn.addEventListener('click', () => {
        timerState.running = false;
        timerState.elapsedTime += Date.now() - timerState.startTime;
        clearInterval(timerState.intervalId);
        startBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
        saveState();
    });

    stopBtn.addEventListener('click', () => {
        timerState.running = false;
        timerState.elapsedTime += Date.now() - timerState.startTime;
        clearInterval(timerState.intervalId);
        saveState();
        startBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        timerDisplay.textContent = '00:00:00';
    });

    // Manual Entry
    manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const project = document.getElementById('project').value;
        const date = document.getElementById('date').value;
        const duration = document.getElementById('duration').value; // hours
        const notes = document.getElementById('notes').value;

        if (!project || !date || !duration) {
            alert('Please fill all required fields');
            return;
        }

        const entry = {
            id: Date.now(),
            project,
            date,
            startTime: null,
            endTime: null,
            duration: parseFloat(duration),
            notes
        };
        entries.unshift(entry);
        saveState();
        renderEntries();
        manualForm.reset();
    });

    function renderEntries() {
        entriesList.innerHTML = '';
        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = '<strong>' + entry.project + '</strong> (' + entry.date + ') - ' + entry.duration + 'h';
            entriesList.appendChild(div);
        });
    }

    // Export
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(entries, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'localtrack_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});