# Overlay Studio 0.3.0

Offline Windows-first editor using Electron, Canvas 2D, embedded SVG/PNG assets,
standard Gamepad API input and a loopback HTTP/SSE bridge.

## Source provenance

- `README.txt` supplied in chat: final Cudi behavior and 1672 × 1241 target.
- `CUDI-OBS-Final.css` supplied in chat: embedded neutral shell, ambient art,
  stick caps, per-button input graphics, trigger masks and clearance mask.
- `index.html` supplied in chat: V6 input-state separation and trigger behavior
  informed this implementation. Its original Vue bundles were not provided.
- Supplied screenshots: visual comparison reference.

`app/assets.js` embeds the extracted assets. Decoded source assets are preserved in the original development workspace. The Windows bundle only needs assets.js. All branding
and template rights remain with their respective owners; this build does not
establish redistribution rights for a public template marketplace.

## Run or rebuild

Install Node.js 22 or later. Run `npm ci`, then `npm start` (internet needed only
for developer dependency/runtime installation). `npm run build:win` invokes
electron-builder for a ZIP Windows x64 target. The distributed ZIP was
assembled using the official Electron 39.8.10 Windows x64 release, preserving
its runtime licenses and required DLLs, and adding resources/app.

App structure: main.cjs owns native file dialogs and loopback service;
app/preload.cjs exposes narrowly scoped IPC; studio.js owns editor state;
renderer.js is shared with exported HTML. No runtime npm modules are required.
The editable project schema is version 1. Imported project strings and numeric
bounds are validated. Logos are limited to PNG/JPEG under 8 MB.

## Checks

`node --check main.cjs`, `node --check app/studio.js`, `node --check app/renderer.js`.

For browser checks, serve app/ at http://127.0.0.1:8765, then run `node smoke.cjs`.
It uses Chromium at /usr/bin/chromium (adjust executablePath on other systems).
`node bridge-test.cjs` exercises main.cjs with a mocked Electron shell and real
loopback HTTP/SSE. Windows executable launch, hardware mapping, background
sampling and OBS capture remain unverified.

## Next integration milestone

Test the ZIP on Windows with the physical G7 8K and OBS, including focus loss,
minimize/restore, disconnect/reconnect, simultaneous input, pressure ramps and
live refresh. Add a GameSir adapter only after inspecting actual host reports.
Use vendor event streams rather than guessing mappings for M/Home/Capture.

## Base color and positioning checks

Serve app/ at http://127.0.0.1:8766 and run `node positioning-test.cjs`.
Override STUDIO_URL or CHROMIUM_PATH as needed. This checks old-project
migration, tint pixels/transparency, whole-overlay translation, pointer
dragging for controller/artwork, undo/redo, centering, keyboard input,
autosave and independently rendered HTML. Base tint is cached until the
color changes; translations apply to the entire renderer, including meters.

The default design uses editable PLAYER text; the Cudi example is an optional
reference preset. Existing saved projects are preserved rather than reset.
A clean shell asset is still needed to eliminate faint baked reference artwork.

## Button colors, Home and effects

Serve app/ at port 8766 and run `node colors-effects-test.cjs`. It verifies
rest/pressed color independence, inheritance, backward compatibility, invalid
project rejection, Home clipping, effect animation/decay, transparency,
autosave/undo and exported HTML. Colors live in optional buttonColors entries
with rest/pressed hex values. Missing entries inherit baseColor and pressed.
Older version-1 projects default to an empty map and effect=none.

Button clip paths and symbols are parsed once from the supplied SVGs, then
drawn synchronously with Canvas/Path2D. Home uses a new circular emblem with a
single X silhouette, inset inside the face to preserve its chrome rim. The
renderer no longer creates asynchronously recolored button images each frame.
Effects use the existing animation loop, without network assets or libraries.
