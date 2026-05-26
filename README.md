# LocalTrack Extension

## Goal
Build a privacy-first, local-only Browser Extension called 'LocalTrack' for tracking project time. The extension must operate entirely offline with zero cloud dependency, accounts, or telemetry.

## Tech Stack
Vanilla JS, HTML, CSS, Manifest V3. No external libraries. Store data using browser extension storage API.

## Files
- manifest.json
- index.html
- popup.js
- styles.css
- background.js

## Acceptance Criteria
1. Extension installs and launches without errors.
2. Timer persists across popup close/open.
3. Manual entries save and retrieve correctly from local storage.
4. Export generates valid files with correct data.
5. No network requests; all logic is client-side.
6. UI is responsive and clean.
