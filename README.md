# LocalTrack Browser Extension

## Goal
Build a privacy-first, local-only Browser Extension for tracking project time. Operates entirely offline with zero cloud dependency.

## Tech Stack
- Vanilla JS
- HTML/CSS
- Manifest V3

## Files
- manifest.json: Extension configuration.
- index.html: Main popup UI.
- popup.js: Core UI logic, timer, storage, and export.
- background.js: Service worker for persistent timer state.
- styles.css: UI styling.

## Acceptance Criteria
1. Extension installs and launches without errors.
2. Timer persists across popup close/open.
3. Manual entries save and retrieve correctly.
4. Export generates valid files.
5. No network requests.
6. UI is responsive.
