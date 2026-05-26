import os
import json
import re

PROJECT_DIR = "/workspace/projects/LocalTrack"

def test_criterion_1_install_launch():
    required_files = ["manifest.json", "index.html", "popup.js", "styles.css", "background.js"]
    for f in required_files:
        assert os.path.exists(os.path.join(PROJECT_DIR, f)), f"Missing {f}"
    with open(os.path.join(PROJECT_DIR, "manifest.json")) as f:
        manifest = json.load(f)
    assert manifest.get("manifest_version") == 3
    assert "storage" in manifest.get("permissions", [])
    assert "tabs" in manifest.get("permissions", [])

def test_criterion_2_timer_persist():
    with open(os.path.join(PROJECT_DIR, "background.js")) as f:
        bg_content = f.read()
    assert "chrome.runtime.onMessage" in bg_content or "chrome.storage" in bg_content
    assert "timer" in bg_content.lower() or "start" in bg_content.lower()

def test_criterion_3_manual_entry():
    with open(os.path.join(PROJECT_DIR, "popup.js")) as f:
        popup_content = f.read()
    assert "project" in popup_content.lower()
    assert "duration" in popup_content.lower()
    assert "chrome.storage.local" in popup_content or "storage" in popup_content.lower()

def test_criterion_4_export():
    with open(os.path.join(PROJECT_DIR, "popup.js")) as f:
        popup_content = f.read()
    assert "Blob" in popup_content
    assert "URL.createObjectURL" in popup_content or "URL" in popup_content

def test_criterion_5_no_network():
    files = ["manifest.json", "index.html", "popup.js", "styles.css", "background.js"]
    for f in files:
        path = os.path.join(PROJECT_DIR, f)
        with open(path) as fh:
            content = fh.read()
        assert "fetch(" not in content
        assert "XMLHttpRequest" not in content

def test_criterion_6_ui_responsive():
    with open(os.path.join(PROJECT_DIR, "styles.css")) as f:
        css_content = f.read()
    assert "flex" in css_content.lower() or "grid" in css_content.lower() or "@media" in css_content