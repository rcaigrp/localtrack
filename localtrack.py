import json
import os

class LocalStorage:
    def __init__(self, storage_file='localtrack_storage.json'):
        self.storage_file = storage_file
        
    def get(self, key):
        try:
            with open(self.storage_file, 'r') as f:
                data = json.load(f)
                return data.get(key, None)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    def set(self, data):
        try:
            with open(self.storage_file, 'w') as f:
                json.dump(data, f)
        except Exception:
            pass  # Silently fail for now

# Global storage instance
storage = LocalStorage()

def get_timer_state():
    return storage.get('timer')

def save_timer_state(timer_data):
    current_data = storage.get('timer') or {}
    current_data.update(timer_data)
    storage.set({'timer': current_data})


def add_entry(entry):
    entries = storage.get('entries') or []
    entries.append(entry)
    storage.set({'entries': entries})


def get_entries():
    return storage.get('entries') or []


def export_entries(filename='export.txt'):
    entries = get_entries()
    # Simple export to text file
    with open(filename, 'w') as f:
        for entry in entries:
            f.write(f"{entry['project']}: {entry['time_spent']} minutes\n")
    return filename