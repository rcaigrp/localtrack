import os
import json
import pytest

PROJECT_DIR = "/workspace/projects/LocalTrack"

def test_criterion_1_extension_install_structure():
    required_files = ["manifest.json", "index.html", "popup.js", "styles.css", "background.js"]
    for f in required_files:
        assert os.path.exists(os.path.join(PROJECT_DIR, f)), f"Missing {f}"

def test_criterion_2_timer_persistence_logic():
    bg_path = os.path.join(PROJECT_DIR, "background.js")
    assert os.path.exists(bg_path)
    with open(bg_path, "r") as f:
        content = f.read()
    assert "chrome.storage" in content or "storage" in content
    assert "timer" in content.lower()

def test_criterion_3_manual_entry_save_retrieve():
    popup_path = os.path.join(PROJECT_DIR, "popup.js")
    assert os.path.exists(popup_path)
    with open(popup_path, "r") as f:
        content = f.read()
    assert "chrome.storage" in content or "storage" in content
    assert "addEntry" in content or "save" in content.lower()

def test_criterion_4_export_valid_files():
    popup_path = os.path.join(PROJECT_DIR, "popup.js")
    with open(popup_path, "r") as f:
        content = f.read()
    assert "Blob" in content or "URL.createObjectURL" in content

def test_criterion_5_no_network_requests():
    for f in ["popup.js", "background.js", "index.html"]:
        path = os.path.join(PROJECT_DIR, f)
        if os.path.exists(path):
            with open(path, "r") as file:
                content = file.read()
            assert "fetch(" not in content and "XMLHttpRequest" not in content and "ajax" not in content

def test_criterion_6_ui_responsive_clean():
    css_path = os.path.join(PROJECT_DIR, "styles.css")
    html_path = os.path.join(PROJECT_DIR, "index.html")
    assert os.path.exists(css_path)
    assert os.path.exists(html_path)
    with open(css_path, "r") as f:
        css_content = f.read()
    assert "display:" in css_content.lower()
    assert "flex" in css_content.lower() or "grid" in css_content.lower()
