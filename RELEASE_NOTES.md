# Tab Copy v1.1.1

## Changes

- Reject clipboard text above 65,536 characters or 100 links before opening any tabs.
- Trim unmatched closing brackets in linear time to avoid freezing on long pasted URLs.
- Show the relevant size limit in the popup while preserving supported link formats, order, and duplicates.

Trailing punctuation is treated as surrounding text. Percent-encode it when it belongs to a URL. Opening pasted links makes normal browser requests to those websites.

## Installation

1. Download `tab-copy-extension.zip` from this release.
2. Extract the archive.
3. Open `chrome://extensions` or `edge://extensions`.
4. Enable Developer mode.
5. Click Load unpacked.
6. Select the extracted folder containing `manifest.json`.
