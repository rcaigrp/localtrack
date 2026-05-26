import os
import json
import re

PROJECT_DIR = '/workspace/projects/LocalTrack'

def read_file(filename):
    path = os.path.join(PROJECT_DIR, filename)
    with open(path, 'r') as f:
        return f.read()

def test_criterion_1_install():
    # Check manifest.json structure
    content = read_file('manifest.json')
    manifest = json.loads(content)
    assert manifest.get('manifest_version') == 3
    assert 'permissions' in manifest
    assert 'storage' in manifest['permissions']
    assert 'action' in manifest
    assert 'default_popup' in manifest['action']
    assert manifest['action']['default_popup'] == 'index.html'

def test_criterion_2_persist():
    # Check popup.js uses chrome.storage.local
    content = read_file('popup.js')
    assert 'chrome.storage.local' in content
    assert 'get(' in content
    assert 'set(' in content

def test_criterion_3_manual():
    # Check popup.js has form handling logic
    content = read_file('popup.js')
    assert 'addEventListener' in content
    assert 'submit' in content or 'click' in content
    assert 'project' in content.lower()
    assert 'duration' in content.lower()

def test_criterion_4_export():
    # Check export uses Blob and createObjectURL
    content = read_file('popup.js')
    assert 'Blob' in content
    assert 'createObjectURL' in content
    assert 'download' in content

def test_criterion_5_no_network():
    # Check no network requests in popup.js
    content = read_file('popup.js')
    # Check for fetch or XMLHttpRequest
    assert 'fetch(' not in content
    assert 'XMLHttpRequest' not in content
    assert 'ajax' not in content

def test_criterion_6_ui():
    # Check styles.css has responsive layout
    content = read_file('styles.css')
    # Must have flex or width: 100%
    assert 'display: flex' in content or 'width: 100%' in content
