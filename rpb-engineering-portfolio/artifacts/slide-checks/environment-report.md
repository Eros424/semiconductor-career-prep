# Playwright environment report

Date: 2026-11-19

## Environment

- macOS 13.7.8
- Intel x86_64
- Node v24.21.0
- npm 11.19.0
- Playwright 1.65.1
- Google Chrome: not installed
- Chromium: not installed
- Safari: installed at `/Applications/Safari.app`

## Attempts

- `chromium.launch({ channel: 'chrome', headless: false })` failed because Google Chrome is not installed.
- `npx playwright install chromium` failed because Playwright does not support Chromium on macOS 13.
- `npx playwright install webkit` failed because Playwright does not support WebKit on macOS 13.
- `npm run test:slides` exits with code 1 because no Playwright browser executable is available.

Safari cannot be passed as a `chromium.launch()` executable. Playwright's WebKit browser also cannot be installed on this macOS version.

## Manual fallback

1. Open the Vite page with `npm run dev -- --host 0.0.0.0 --port 4173`.
2. Open `http://127.0.0.1:4173/` in Safari.
3. Switch to Presentation.
4. At each Slide ID, record the frame top, left, width, and height in Safari Web Inspector using `document.querySelector('#intro').getBoundingClientRect()` and the equivalent selector for each ID.
5. Check children with `.case-title,.case-text,.case-image,.keyword-card,.result-buttons,.closing-transfer` and confirm their rectangles remain within the Slide Frame.
6. Repeat at 1920×1080, 1440×900, 1366×768, and 390×844.

The existing automated script remains available as `npm run test:slides`. Set `PW_CHANNEL=chrome` when Google Chrome is installed.
