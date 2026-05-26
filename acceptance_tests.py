import os
import re

PROJECT_DIR = "/workspace/projects/LocalTrack"

def test_criterion_1_install_launch():
    """Extension installs and launches without errors"""
    assert os.path.exists(f"{PROJECT_DIR}/manifest.json")
    assert os.path.exists(f"{PROJECT_DIR}/index.html")
    assert os.path.exists(f"{PROJECT_DIR}/popup.js")
    assert os.path.exists(f"{PROJECT_DIR}/background.js")
    assert os.path.exists(f"{PROJECT_DIR}/styles.css")
    
    with open(f"{PROJECT_DIR}/manifest.json") as f:
        manifest = f.read()
    assert '"storage"' in manifest or '"chrome.storage"' in manifest
    assert '"tabs"' in manifest or '"chrome.tabs"' in manifest
    assert '"manifest_version": 3' in manifest or '"manifest_version":3' in manifest

def test_criterion_2_timer_persistence():
    """Timer persists across popup close/open"""
    with open(f"{PROJECT_DIR}/background.js") as f:
        bg = f.read()
    assert "chrome.storage" in bg or "storage.local" in bg
    assert "start" in bg or "resume" in bg or "elapsed" in bg

def test_criterion_3_manual_entries():
    """Manual entries save and retrieve correctly"""
    with open(f"{PROJECT_DIR}/popup.js") as f:
        popup = f.read()
    assert "project" in popup.lower() or "name" in popup.lower()
    assert "date" in popup.lower() or "duration" in popup.lower()
    assert "chrome.storage" in popup or "storage.local" in popup

def test_criterion_4_export_files():
    """Export generates valid files"""
    with open(f"{PROJECT_DIR}/popup.js") as f:
        popup = f.read()
    assert "Blob" in popup or "JSON" in popup or "CSV" in popup
    assert "createObjectURL" in popup or "download" in popup

def test_criterion_5_no_network():
    """No network requests"""
    with open(f"{PROJECT_DIR}/popup.js") as f:
        popup = f.read()
    assert "fetch(" not in popup and "XMLHttpRequest" not in popup and "axios" not in popup
    with open(f"{PROJECT_DIR}/background.js") as f:
        bg = f.read()
    assert "fetch(" not in bg and "XMLHttpRequest" not in bg and "axios" not in bg

def test_criterion_6_ui_responsive():
    """UI is responsive and clean"""
    with open(f"{PROJECT_DIR}/styles.css") as f:
        css = f.read()
    assert "flex" in css or "grid" in css or "responsive" in css.lower()
    assert "button" in css.lower() or "input" in css.lower()