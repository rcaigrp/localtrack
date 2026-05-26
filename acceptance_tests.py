import os
import pytest

PROJECT_DIR = "/workspace/projects/LocalTrack"

def test_criterion_1_extension_installs():
    manifest_path = os.path.join(PROJECT_DIR, "manifest.json")
    assert os.path.exists(manifest_path), "manifest.json missing"
    with open(manifest_path) as f:
        content = f.read()
    assert '"manifest_version": 3' in content, "Manifest V3 required"
    assert '"permissions": ["storage", "tabs"]' in content, "Permissions missing"

def test_criterion_2_timer_persists():
    bg_path = os.path.join(PROJECT_DIR, "background.js")
    popup_path = os.path.join(PROJECT_DIR, "popup.js")
    assert os.path.exists(bg_path), "background.js missing"
    assert os.path.exists(popup_path), "popup.js missing"
    with open(bg_path) as f:
        bg_content = f.read()
    assert "chrome.storage" in bg_content or "storage" in bg_content, "Background must handle storage"
    with open(popup_path) as f:
        popup_content = f.read()
    assert "chrome.storage" in popup_content or "storage" in popup_content, "Popup must handle storage"

def test_criterion_3_manual_entries():
    popup_path = os.path.join(PROJECT_DIR, "popup.js")
    with open(popup_path) as f:
        content = f.read()
    assert "entry-form" in content or "submit" in content, "Form handling missing"
    assert "chrome.storage.local" in content or ".local" in content, "Local storage save missing"

def test_criterion_4_export():
    popup_path = os.path.join(PROJECT_DIR, "popup.js")
    with open(popup_path) as f:
        content = f.read()
    assert "export" in content.lower(), "Export function missing"
    assert "Blob" in content or "createObjectURL" in content, "Blob export missing"

def test_criterion_5_no_network():
    popup_path = os.path.join(PROJECT_DIR, "popup.js")
    bg_path = os.path.join(PROJECT_DIR, "background.js")
    files = [popup_path, bg_path]
    for path in files:
        with open(path) as f:
            content = f.read()
        assert "fetch(" not in content, "fetch() found in " + path
        assert "XMLHttpRequest" not in content, "XMLHttpRequest found in " + path
        assert "navigator.connection" not in content, "Network detection found"

def test_criterion_6_ui_responsive():
    html_path = os.path.join(PROJECT_DIR, "index.html")
    css_path = os.path.join(PROJECT_DIR, "styles.css")
    assert os.path.exists(html_path), "index.html missing"
    assert os.path.exists(css_path), "styles.css missing"
    with open(html_path) as f:
        html_content = f.read()
    assert '<meta name="viewport"' in html_content, "Viewport meta tag missing"
    with open(css_path) as f:
        css_content = f.read()
    assert "display" in css_content, "CSS layout rules missing"
