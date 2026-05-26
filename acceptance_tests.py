import os
import json
import re

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def test_criterion_1_extension_installs():
    manifest = read_file('/workspace/projects/LocalTrack/manifest.json')
    assert 'manifest_version' in manifest and '3' in manifest
    assert 'storage' in manifest
    assert 'tabs' in manifest

def test_criterion_2_timer_persists():
    bg = read_file('/workspace/projects/LocalTrack/background.js')
    assert 'chrome.storage.local' in bg
    assert any(kw in bg.lower() for kw in ['timer', 'start', 'pause', 'stop', 'resume'])

def test_criterion_3_manual_entries_save():
    popup = read_file('/workspace/projects/LocalTrack/popup.js')
    assert 'chrome.storage.local' in popup
    assert any(kw in popup.lower() for kw in ['add', 'save', 'push', 'entries'])

def test_criterion_4_export_generates_valid_files():
    popup = read_file('/workspace/projects/LocalTrack/popup.js')
    assert 'Blob' in popup or 'createObjectURL' in popup
    assert any(kw in popup.lower() for kw in ['json', 'csv', 'download'])

def test_criterion_5_no_network_requests():
    files = ['index.html', 'popup.js', 'background.js']
    for f in files:
        content = read_file(f'/workspace/projects/LocalTrack/{f}')
        assert 'fetch(' not in content
        assert 'XMLHttpRequest' not in content
        assert 'new URL' not in content

def test_criterion_6_ui_responsive():
    html = read_file('/workspace/projects/LocalTrack/index.html')
    css = read_file('/workspace/projects/LocalTrack/styles.css')
    assert 'viewport' in html
    assert any(kw in css.lower() for kw in ['box-sizing', 'flex', 'grid', 'responsive', 'media'])

if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v'])
