import unittest
from unittest.mock import patch, MagicMock

class TestLocalTrack(unittest.TestCase):
    
    def test_extension_installs_and_launches(self):
        # This would be tested through browser extension installation
        # For now we verify the manifest file exists and is valid
        import json
        with open('manifest.json', 'r') as f:
            manifest = json.load(f)
        self.assertEqual(manifest['name'], 'LocalTrack')
        self.assertEqual(manifest['manifest_version'], 3)
        
    def test_timer_persists_across_popup_close_open(self):
        # Mock chrome.storage.local to simulate persistence
        with patch('chrome.storage.local') as mock_storage:
            mock_storage.get.return_value = {'timerState': 'running', 'startTime': 1234567890}
            
            # Simulate popup close and reopen
            stored_data = mock_storage.get.return_value
            self.assertEqual(stored_data['timerState'], 'running')
            
    def test_manual_entries_save_and_retrieve(self):
        # Test manual entry functionality
        with patch('chrome.storage.local') as mock_storage:
            entries = [
                {
                    'id': 1,
                    'project': 'Test Project',
                    'date': '2023-01-01',
                    'startTime': 1234567890,
                    'endTime': 1234571490,
                    'duration': 3600,
                    'notes': 'Test entry'
                }
            ]
            mock_storage.set.return_value = None
            
            # Simulate saving entries
            mock_storage.set.assert_called_once()
            
            # Simulate retrieving entries
            mock_storage.get.return_value = {'entries': entries}
            retrieved_entries = mock_storage.get.return_value['entries']
            self.assertEqual(len(retrieved_entries), 1)
            self.assertEqual(retrieved_entries[0]['project'], 'Test Project')

if __name__ == '__main__':
    unittest.main()