<p align="center">
  <img src="assets/banner.svg" alt="Tab Copy banner" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Majkey25/tab-copy-extension/releases/latest/download/tab-copy-extension.zip">
    <img src="https://img.shields.io/badge/DOWNLOAD-LATEST_RELEASE-black?style=for-the-badge" alt="Download latest release">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-black?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome-supported-black?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome supported">
  <img src="https://img.shields.io/badge/Edge-supported-black?style=flat-square&logo=microsoftedge&logoColor=white" alt="Edge supported">
  <img src="https://img.shields.io/github/v/release/Majkey25/tab-copy-extension?style=flat-square&color=black" alt="Latest release">
  <img src="https://img.shields.io/github/license/Majkey25/tab-copy-extension?style=flat-square&color=black" alt="MIT license">
</p>

<p align="center">
  Select individual browser tabs or a continuous range, then copy their URLs in the correct order.
</p>

## Download

**[Download the latest Tab Copy ZIP](https://github.com/Majkey25/tab-copy-extension/releases/latest/download/tab-copy-extension.zip)**

You can also open the [latest GitHub Release](https://github.com/Majkey25/tab-copy-extension/releases/latest) to view release notes and versioned downloads.

> Chrome and Edge cannot install an unsigned ZIP directly. Extract the ZIP first, then load the extracted folder through Developer mode.

## Install in Chrome

1. Download [`tab-copy-extension.zip`](https://github.com/Majkey25/tab-copy-extension/releases/latest/download/tab-copy-extension.zip).
2. Extract the ZIP to a permanent folder. Do not delete this folder after installation.
3. Open `chrome://extensions`.
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked**.
6. Select the extracted folder that directly contains `manifest.json`.
7. Open the Extensions menu and pin **Tab Copy**.

## Install in Microsoft Edge

1. Download [`tab-copy-extension.zip`](https://github.com/Majkey25/tab-copy-extension/releases/latest/download/tab-copy-extension.zip).
2. Extract the ZIP to a permanent folder.
3. Open `edge://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted folder that directly contains `manifest.json`.
7. Pin **Tab Copy** from the Extensions menu.

## Updating

1. Download the newest release ZIP.
2. Extract it and replace the files in your existing Tab Copy folder.
3. Open `chrome://extensions` or `edge://extensions`.
4. Click the reload button on the Tab Copy extension card.

## Features

- Select individual tabs with a click.
- Select a continuous range with `Shift + Click`.
- Select all tabs or clear the selection instantly.
- Copy one URL per line in the original tab order.
- Minimal black and white interface.
- No analytics, tracking, accounts, storage, or network requests.
- Works in Chromium browsers that support Manifest V3, including Chrome and Edge.

<p align="center">
  <img src="assets/preview.svg" alt="Tab Copy popup preview" width="720">
</p>

## Usage

1. Open the extension popup.
2. Click tabs to select or deselect them.
3. To select a range, click the first tab, hold `Shift`, then click the last tab.
4. Click **COPY**.
5. Paste the URLs anywhere. Each URL is placed on its own line.

## Permissions

| Permission | Why it is required |
| --- | --- |
| `tabs` | Reads the title and URL of tabs in the current browser window. |
| `clipboardWrite` | Copies selected URLs after the user clicks **COPY**. |

The extension does not send data anywhere and does not store browsing data.

## Install from source

1. Clone or download this repository.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository root containing `manifest.json`.

## Development

The project uses plain HTML, CSS, and JavaScript. There is no build step and no runtime dependency.

```bash
npm test
```

Tests use the test runner built into Node.js.

## Releases

The release workflow reads the version from `manifest.json`, creates an installable ZIP with `manifest.json` at its root, and publishes:

- `tab-copy-extension.zip`
- `tab-copy-extension-vX.Y.Z.zip`

GitHub Packages is intentionally not used. Browser extension ZIP files belong in GitHub Releases. GitHub Packages is intended for registries such as npm and container images.

## Project structure

```text
.
├── .github/workflows/release.yml
├── assets/
│   ├── banner.svg
│   └── preview.svg
├── icons/
├── tests/logic.test.js
├── LICENSE
├── RELEASE_NOTES.md
├── manifest.json
├── logic.js
├── popup.css
├── popup.html
└── popup.js
```

## Privacy

Tab Copy works entirely inside the browser. It has no backend, telemetry, analytics, advertisements, or remote code.

## Contributing

Small, focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## License

Licensed under the [MIT License](LICENSE).
