# Tab Copy v1.1.0

## Changes

- Add **PASTE LINKS FROM CLIPBOARD** to open extracted web links as ordered tabs in one separate browser window.
- Accept text lists, Markdown, HTML, JSON, CSV, and common separators. Domains without a protocol use HTTPS. Duplicate links retain their position.
- Ignore malformed links and unsupported protocols. Empty clipboard text opens no window; clipboard or browser errors show **PASTE FAILED**.
- Add `clipboardRead` permission. Clipboard text is read only after clicking Paste and is not stored or sent to the developer.
- Keep existing tab selection and copy behavior.

Trailing punctuation is treated as surrounding text. Percent-encode it when it belongs to a URL. Opening pasted links makes normal browser requests to those websites.

## Installation

1. Download `tab-copy-extension.zip` from this release.
2. Extract the archive.
3. Open `chrome://extensions` or `edge://extensions`.
4. Enable Developer mode.
5. Click Load unpacked.
6. Select the extracted folder containing `manifest.json`.
