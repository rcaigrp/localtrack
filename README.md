# LocalTrack

A privacy-first, local-only Browser Extension for tracking project time.

## Sprint Status
- **Goal**: Build a privacy-first, local-only Browser Extension called 'LocalTrack' for tracking project time.
- **Status**: Active
- **Meetings**: 3/5 (2 remaining)
- **Acceptance Criteria**: 6 total

## Features
- Timer with Start/Pause/Stop. Persists state across popup close/open.
- Manual entry form for Project Name, Date, Duration, Notes.
- Local storage using chrome.storage.local.
- Export to JSON/CSV via Blob and URL.createObjectURL.
- Zero network requests; fully offline.

## Tech Stack
- Vanilla JS, HTML, CSS, Manifest V3.
- No external libraries.

## File Structure
- `manifest.json`: MV3 manifest with storage, tabs permissions.
- `index.html`: Main popup UI.
- `popup.js`: Core logic for timer, manual entry, storage, export.
- `background.js`: Service worker for persistent timer state.
- `styles.css`: Clean, minimal UI styles.

## Usage
- Install in Chromium-based browser.
- Click extension icon to open popup.
- Use timer or manual entry.
- Export data via button.

## Testing
- Run `pytest /workspace/projects/LocalTrack/acceptance_tests.py -v` to verify structure and logic compliance.
- All acceptance criteria verified via static analysis.
