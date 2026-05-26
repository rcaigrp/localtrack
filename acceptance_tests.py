import os
import json
import pytest

PROJECT_DIR = '/workspace/projects/LocalTrack'

def read_file(filename):
    with open(os.path.join(PROJECT_DIR, filename), 'r') as f:
        return f.read()

def test_criterion_1_extension_installs():
    manifest = json.loads(read_file('manifest.json'))
    assert manifest.get('manifest_version') == 3
    assert 'storage' in manifest.get('permissions', [])
    assert 'tabs' in manifest.get('permissions', [])
    assert 'background' in manifest

def test_criterion_2_timer_persists():
    bg = read_file('background.js')
    assert 'chrome.storage' in bg
    assert 'startTime' in bg
    assert 'elapsedTime' in bg or 'duration' in bg
    assert 'startTimer' in bg or 'resumeTimer' in bg

def test_criterion_3_manual_entries_save():
    popup = read_file('popup.js')
    assert 'chrome.storage.local' in popup
    assert 'project' in popup
    assert 'date' in popup
    assert 'duration' in popup
    assert 'notes' in popup
    assert 'saveEntry' in popup or 'save' in popup

def test_criterion_4_export_generates_files():
    popup = read_file('popup.js')
    assert 'JSON.stringify' in popup
    assert 'Blob' in popup
    assert 'createObjectURL' in popup
    assert 'download' in popup or 'click' in popup

def test_criterion_5_no_network_requests():
    popup = read_file('popup.js')
    bg = read_file('background.js')
    assert 'fetch(' not in popup
    assert 'XMLHttpRequest' not in popup
    assert 'fetch(' not in bg
    assert 'XMLHttpRequest' not in bg

def test_criterion_6_ui_responsive():
    html = read_file('index.html')
    assert '<!DOCTYPE html>' in html
    assert '<button' in html
    assert '<input' in html
    assert '<style' in html or 'styles.css' in html
