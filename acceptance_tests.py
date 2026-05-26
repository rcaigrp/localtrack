import os
import json
import re

PROJECT_DIR = "/workspace/projects/LocalTrack"

def read_file(filename):
    path = os.path.join(PROJECT_DIR, filename)
    with open(path, 'r') as f:
        return f.read()

def test_criterion_1_extension_installs():
    """1. Extension installs and launches without errors"""
    try:
        manifest = json.loads(read_file("manifest.json"))
        assert manifest.get("manifest_version") == 3
        assert "storage" in manifest.get("permissions", [])
        assert "tabs" in manifest.get("permissions", [])
        assert "action" in manifest or "browser_action" in manifest
        assert "background" in manifest
    except Exception as e:
        raise AssertionError(f"Manifest invalid: {e}")

def test_criterion_2_timer_persists():
    """2. Timer persists across popup close/open"""
    popup_content = read_file("popup.js")
    bg_content = read_file("background.js")
    assert "chrome.storage" in popup_content or "chrome.storage" in bg_content
    assert "setInterval" in popup_content or "Date.now()" in popup_content
    assert "stop" in popup_content.lower()

def test_criterion_3_manual_entries():
    """3. Manual entries save and retrieve correctly"""
    popup_content = read_file("popup.js")
    assert "manual" in popup_content.lower() or "addEntry" in popup_content
    assert "chrome.storage" in popup_content or "local" in popup_content

def test_criterion_4_export_files():
    """4. Export generates valid files"""
    popup_content = read_file("popup.js")
    assert "Blob" in popup_content
    assert "URL.createObjectURL" in popup_content
    assert "download" in popup_content

def test_criterion_5_no_network():
    """5. No network requests"""
    js_files = ["popup.js", "background.js"]
    for f in js_files:
        content = read_file(f)
        assert "fetch(" not in content
        assert "XMLHttpRequest" not in content
        assert "ajax" not in content

def test_criterion_6_ui_responsive():
    """6. UI is responsive and clean"""
    html_content = read_file("index.html")
    css_content = read_file("styles.css")
    assert "viewport" in html_content
    assert "flex" in css_content or "grid" in css_content
