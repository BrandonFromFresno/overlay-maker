# Overlay Studio 0.6.0

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

## Inspector, bumper coverage and fonts

`node ui-fonts-shoulders-test.cjs` (app/ served at port 8766) checks full LB/RB
rest/press coverage and independent colors, transparent shoulders, click picking,
keyboard tabs, eight bundled fonts, installed-font picker, font project data,
licensed embedded-font export, dialog focus/Escape and responsive widths.
Existing browser tests were updated for the inspector tabs and export dialog.

Bumper top contours follow the base alpha; lower contours follow the shell
seams. Their clipped fills reuse the textured base rather than an incomplete
front-face polygon. Hit tests use these same paths.

Included fonts come from the official Google Fonts repository. Original SIL
Open Font Licenses/copyright notices and source URLs accompany every family in
app/fonts/licenses and the exported font record. Renderer-only CSS aliases
(OSL prefix) distinguish included fonts from identically named system fonts.
Only the chosen included family is embedded in an HTML export. Font choices
are schema-validated and optional for backward-compatible version-1 projects.

The main process lists Windows font family names through a fixed, noninteractive
PowerShell/System.Drawing command, UTF-8 output and a 15-second timeout. No
user text is interpolated into the command and font files are not read or copied.
The bridge test calls this handler and requires nonempty discovery on Windows.
Other development platforms retain the common-font fallback list.

Visual direction reference: https://gamesir.com/. Overlay Studio retains its
own branding; the interface does not claim official GameSir affiliation.

## Independent shell, effects and preset tests

`node shell-presets-test.cjs` checks shell/default color isolation across all
19 existing controls at rest and pressed, seven new animated shell-only effects,
seven protected patterns, all 16 presets, keep-artwork/font behavior, preserved
layout, Undo, legacy migration, persistence, responsive menus and standalone HTML.

The renderer derives a control protection mask from the actual button paths,
bumpers, chrome, D-pad and stick regions. A complementary shell mask excludes
those controls from tint/patterns/effects. The base composites complementary
shell/control layers additively to retain the original alpha. Default resting
controls use buttonBaseColor, independent from baseColor. Older version-1 files
without buttonBaseColor copy their old baseColor once during validation.

Presets are local validated data in app/presets.js; fonts remain in the existing
licensed offline library. Patterns and effects are deterministic Canvas vectors,
with no character images, third-party assets, external dependencies or downloads.
Each preset applies visual fields; all placement fields are preserved. An optional
wordmark switch preserves the user's logo/text and font properties when disabled.
There is no new L5/R5 input integration in this release.

## Anime painter (0.6)

`app/themes.js` is a dependency-free Canvas factory serialized into HTML export
alongside the renderer. It receives parsed face geometry and the protected shell
mask. A cached engraving canvas, reusable pulse canvas and 128px emblem scratch
canvas avoid per-frame allocation. Presets select independent themeStyle,
buttonStyle and homeStyle settings. Explicit rest/pressed colors still exist;
themed materials overlay ABXY/Home and expose pressed color on their rims.

Animation modes use a fixed timestamp in Still mode or slower timestamp and lower
shell opacity in Reduced mode. Input edge detection uses the original timestamp,
so ring lifetimes remain 700ms at either motion speed. Backward timestamps clear
transient state. Full/Reduced/Still do not alter Gamepad API or OBS bridge input.
New fields have validated defaults for older version-1 saved files.

`node anime-themes-test.cjs` checks every preset's animation, theme distinctions,
still frames and live press response, shell/control isolation, event expiry and
rearming, search, Undo, save/reopen, reduced-motion preference and exported HTML.
Set STUDIO_URL to the local app server for browser tests.

The paused controller gallery/Tarantula work is retained separately on the local
`paused-controller-gallery` branch. This release builds on the G7-only 0.5 editor.
