# LocalTrack

Privacy-first, local-only browser extension for tracking project time.

## Features

- Timer with start/pause/stop functionality
- Manual entry form for project details
- Local storage using browser extension APIs
- Export to JSON and CSV formats
- Clean, minimal UI

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/example/localtrack.git
   ```
2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `Sources` folder

## Usage

1. Click the LocalTrack icon in the toolbar
2. Start the timer using the "Start" button
3. Add manual entries using the form
4. Export data using the export buttons

## Configuration

No additional configuration required. All data is stored locally in your browser.

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- Manifest V3
- Chrome Extension Storage API