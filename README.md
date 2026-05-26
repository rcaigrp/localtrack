# LocalTrack Browser Extension

## Goal
Build a privacy-first, local-only Browser Extension for tracking project time.

## Architecture
- **UI**: Simple popup layout with timer, manual entry form, and entry list.
- **Storage**: `chrome.storage.local` for entries and timer state.
- **Background**: Service worker (`background.js`) for persistent timer state.
- **Export**: JSON and CSV generation using Blob and URL.createObjectURL.

## Sprint Status
- Meeting 2: Initialized project, defined acceptance criteria, and implemented core files.
- Next: Verify acceptance tests and refine UI/UX.