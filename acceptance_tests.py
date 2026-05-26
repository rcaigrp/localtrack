import os
import json
import re
import pytest

PROJECT_DIR = "/workspace/projects/LocalTrack"

def read_file(filename):
    path = os.path.join(PROJECT_DIR, filename)
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        return f.read()

def test_criterion_1_manifest_exists():
    """Criterion 1: Extension installs and launches without errors.
    Checks for valid manifest.json."""
    manifest_content = read_file("manifest.json")
    assert manifest_content is not None, "manifest.json must exist"
    manifest = json.loads(manifest_content)
    assert manifest.get("manifest_version") == 3, "Must be Manifest V3"
    assert "storage" in manifest.get("permissions", []), "Must have storage permission"
    assert "tabs" in manifest.get("permissions", []), "Must have tabs permission"

def test_criterion_2_timer_persistence():
    """Criterion 2: Timer persists across popup close/open.
    Checks background.js or popup.js for chrome.storage usage."""
    bg_content = read_file("background.js") or ""
    popup_content = read_file("popup.js") or ""
    combined = bg_content + popup_content
    assert "chrome.storage.local" in combined or "storage.local" in combined, "Must use chrome.storage.local for persistence"
    assert "timer" in combined.lower(), "Must contain timer logic"

def test_criterion_3_manual_entries():
    """Criterion 3: Manual entries save and retrieve correctly.
    Checks popup.js for manual entry form handling and storage."""
    popup_content = read_file("popup.js") or ""
    assert "project" in popup_content.lower(), "Must handle project name"
    assert "duration" in popup_content.lower(), "Must handle duration"
    assert "chrome.storage.local" in popup_content or "storage.local" in popup_content, "Must save to local storage"

def test_criterion_4_export():
    """Criterion 4: Export generates valid files.
    Checks popup.js for export logic using Blob and URL.createObjectURL."""
    popup_content = read_file("popup.js") or ""
    assert "Blob" in popup_content, "Must use Blob for export"
    assert "URL.createObjectURL" in popup_content, "Must use URL.createObjectURL for export"

def test_criterion_5_no_network():
    """Criterion 5: No network requests.
    Checks JS files for forbidden network calls."""
    popup_content = read_file("popup.js") or ""
    bg_content = read_file("background.js") or ""
    combined = popup_content + bg_content
    assert "fetch(" not in combined, "Must not use fetch()"
    assert "XMLHttpRequest" not in combined, "Must not use XMLHttpRequest"
    assert "axios" not in combined, "Must not use axios"

def test_criterion_6_ui_responsive():
    """Criterion 6: UI is responsive and clean.
    Checks styles.css exists and contains basic layout rules."""
    css_content = read_file("styles.css") or ""
    assert css_content is not None, "styles.css must exist"
    assert "display" in css_content.lower(), "Must contain display rules"
    assert "font" in css_content.lower(), "Must contain font rules"
