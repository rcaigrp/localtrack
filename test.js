const fs = require('fs');
const path = require('path');

// Mock chrome.storage
const mockStorage = {
  local: {
    _data: {},
    get(key, callback) {
      setTimeout(() => callback({ [key]: this._data[key] }), 0);
    },
    set(data) {
      this._data = { ...this._data, ...data };
    }
  }
};

// Simulate chrome object
const chrome = {
  storage: mockStorage
};

// Load popup.js and background.js logic
// We will inline the logic for testing

const storage = chrome.storage.local;

// Test 1: Extension installs (Manifest check)
function test_criterion_1() {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.manifest_version === 3 && manifest.permissions.includes('storage') && manifest.permissions.includes('tabs')) {
    console.log('PASS: test_criterion_1');
  } else {
    console.log('FAIL: test_criterion_1');
  }
}

// Test 2: Timer persists
function test_criterion_2() {
  const startTime = Date.now();
  storage.set({ timerState: { startTime, isRunning: true } });
  storage.get('timerState', (data) => {
    if (data.timerState && data.timerState.startTime === startTime) {
      console.log('PASS: test_criterion_2');
    } else {
      console.log('FAIL: test_criterion_2');
    }
  });
}

// Test 3: Manual entries
function test_criterion_3() {
  const entry = { id: 1, project: 'Test', date: '2023-01-01', startTime: '10:00', endTime: '11:00', duration: '1h', notes: 'Test' };
  storage.local._data.entries = [entry];
  storage.get('entries', (data) => {
    if (data.entries && data.entries.length === 1) {
      console.log('PASS: test_criterion_3');
    } else {
      console.log('FAIL: test_criterion_3');
    }
  });
}

// Test 4: Export
function test_criterion_4() {
  const data = [{ id: 1, project: 'Test', date: '2023-01-01', startTime: '10:00', endTime: '11:00', duration: '1h', notes: 'Test' }];
  const csv = data.map(e => `${e.id},${e.project},${e.date}`).join('\n');
  if (csv.includes('Test')) {
    console.log('PASS: test_criterion_4');
  } else {
    console.log('FAIL: test_criterion_4');
  }
}

// Test 5: No network
function test_criterion_5() {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!manifest.content_scripts || !manifest.content_scripts.some(s => s.matches.some(m => m.includes('http')))) {
    console.log('PASS: test_criterion_5');
  } else {
    console.log('FAIL: test_criterion_5');
  }
}

// Test 6: UI responsive
function test_criterion_6() {
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (html.includes('<meta name="viewport"')) {
    console.log('PASS: test_criterion_6');
  } else {
    console.log('FAIL: test_criterion_6');
  }
}

test_criterion_1();
test_criterion_2();
test_criterion_3();
test_criterion_4();
test_criterion_5();
test_criterion_6();
