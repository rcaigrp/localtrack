import os
import re

project_dir = '/workspace/projects/LocalTrack'

def test_criterion_1_extension_installs():
    manifest_path = os.path.join(project_dir, 'manifest.json')
    assert os.path.exists(manifest_path), 'manifest.json does not exist'
    with open(manifest_path, 'r') as f:
        content = f.read()
    assert 'manifest_version' in content and '3' in content, 'Manifest must be V3'
    assert 'permissions' in content, 'Manifest must have permissions'

def test_criterion_2_timer_persists():
    bg_path = os.path.join(project_dir, 'background.js')
    assert os.path.exists(bg_path), 'background.js does not exist'
    with open(bg_path, 'r') as f:
        content = f.read()
    assert 'chrome.storage' in content or 'storage' in content, 'Background must use storage for persistence'

def test_criterion_3_manual_entries():
    popup_path = os.path.join(project_dir, 'popup.js')
    assert os.path.exists(popup_path), 'popup.js does not exist'
    with open(popup_path, 'r') as f:
        content = f.read()
    assert 'chrome.storage.local' in content, 'Popup must use local storage'
    assert 'manual' in content.lower() or 'entry' in content.lower(), 'Popup must handle manual entries'

def test_criterion_4_export_generates_files():
    popup_path = os.path.join(project_dir, 'popup.js')
    with open(popup_path, 'r') as f:
        content = f.read()
    assert 'Blob' in content or 'download' in content.lower(), 'Export must use Blob or download logic'

def test_criterion_5_no_network_requests():
    files = ['index.html', 'popup.js', 'background.js']
    for f in files:
        path = os.path.join(project_dir, f)
        if os.path.exists(path):
            with open(path, 'r') as file:
                content = file.read()
                assert 'fetch(' not in content and 'XMLHttpRequest' not in content, f'{f} contains network requests'

def test_criterion_6_ui_responsive():
    css_path = os.path.join(project_dir, 'styles.css')
    assert os.path.exists(css_path), 'styles.css does not exist'
    with open(css_path, 'r') as f:
        content = f.read()
    assert 'display: flex' in content or 'display: grid' in content, 'UI must use flex or grid'
    html_path = os.path.join(project_dir, 'index.html')
    with open(html_path, 'r') as f:
        content = f.read()
    assert 'viewport' in content, 'UI must have viewport meta tag'
