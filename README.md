# LocalTrack Browser Extension

## Goal
Build a privacy-first, local-only Browser Extension for tracking project time. Operates entirely offline with zero cloud dependency.

## Architecture
- **UI**: Vanilla JS, HTML, CSS in popup
- **Storage**: `chrome.storage.local` for timer state and entries
- **Background**: Service worker for persistent timer state
- **Testing**: `pytest` with structural validation of JS/HTML/JSON files

## Sprint Status
- Meeting 1: Architecture design, API research, dependency selection. (Pivoted from iOS to Browser Extension per constraints)
- Meeting 2: Implemented core files (manifest, HTML, JS, CSS, background) and acceptance tests.
- Current: Tests passing. Ready for completion.