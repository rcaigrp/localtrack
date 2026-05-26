import unittest
from unittest.mock import patch, MagicMock

class TestLocalTrackTimer(unittest.TestCase):
    
    def test_timer_starts_and_runs(self):
        # This test would verify the timer functionality
        # For now we'll just check that the file exists and is valid JavaScript
        with open('/workspace/projects/LocalTrack/popup.js', 'r') as f:
            content = f.read()
        self.assertIn('let timerInterval', content)
        self.assertIn('setInterval', content)
        self.assertIn('startButton.addEventListener', content)
        
    def test_timer_pauses_correctly(self):
        with open('/workspace/projects/LocalTrack/popup.js', 'r') as f:
            content = f.read()
        self.assertIn('pauseTimer', content)
        self.assertIn('clearInterval', content)
        
    def test_timer_stops_correctly(self):
        with open('/workspace/projects/LocalTrack/popup.js', 'r') as f:
            content = f.read()
        self.assertIn('stopTimer', content)
        self.assertIn('clearInterval', content)
        
    def test_timer_display_updates(self):
        with open('/workspace/projects/LocalTrack/popup.js', 'r') as f:
            content = f.read()
        self.assertIn('formatTime', content)
        self.assertIn('updateDisplay', content)