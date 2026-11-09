# Overlay Studio 0.8.1 Windows prerelease

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
electron-builder for a ZIP Windows x64 target. The candidate ZIP is built with electron-builder and Electron 39.8.10 Windows
x64, preserving runtime notices and required DLLs. A cached official Electron ZIP
can be supplied with the electronDist build option for an offline runtime build.

App structure: main.cjs owns native file dialogs and loopback service;
app/preload.cjs exposes narrowly scoped IPC; studio.js owns editor state;
renderer.js is shared with exported HTML. No runtime npm modules are required.
The editable project schema is version 1. Imported project strings and numeric
bounds are validated. Logos are limited to PNG/JPEG under 8 MB.

## Checks

Run `npm run check` for every app/tool/test JavaScript file and `npm test` for
all native and browser suites. The runner starts an ephemeral-port app server,
sets STUDIO_URL, selects Chromium using CHROMIUM_PATH or Playwright's browser,
and stores artifacts under OVERLAY_TEST_OUTPUT (a temporary folder by default).
Native suites sharing port 18777 run sequentially. Browser suites use at most
two workers. Pass test filenames after `npm test --` to select checks.

`npm run build:win -- --publish never` packages the Windows x64 ZIP, including
START-HERE.txt beside the executable. Packaging is separate from release approval.
See RELEASE-READINESS.md for the current record and Windows/hardware gates.

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
with rest/pressed hex values. Missing entries inherit buttonBaseColor and pressed.
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

## Texture layers and preset UX (0.7)

`textures.js` provides the serializable createTexturePainter factory, the original
finish catalogue and a private IndexedDB image library. The painter caches both
seeded 512px procedural surfaces and the transformed 1672×941 shell layer. Pattern
transforms are applied to canvas patterns rather than oversized filtered surfaces.
Opacity/blend changes reuse the same layer. Image-generation tokens reject stale
decodes; exports await image readiness. texture-ui.js handles local imports and
library state. Renderer setTexture is independent from setLogo.

Version-1 projects gain validated texture fields and presetOrigin. Imported images
are limited to 4MB after optimization; projects allow up to 17MB to accommodate an
existing 12MB logo and texture. Autosave quota errors still ask users to save a file.
HTML export embeds only the selected texture image and painter, without IndexedDB
or external image URLs. TEXTURES.md records the provided site's license and analysis.
The desktop API can open only the fixed tttexture URL, without accepting a URL from
the renderer; the bridge test verifies that destination.

preset-ui.js handles favorites, filters, demo and restore. buildPresetProject and
presetButtonColors in presets.js are shared by cards and actual application, which
keeps thumbnails in sync with the theme. Theme signatures stay in the serialized
Canvas painter, including per-button symbol variation and adaptive contrast.

Run textures-presets-test.cjs with STUDIO_URL pointed at the local server. Optional
FFFUEL_REFERENCE points to a private downloaded JPEG to exercise a real collection
image without distributing it as a test fixture. tools/capture-anime-textures.cjs
produces the public preview figures exclusively from bundled procedural artwork.

## Surface painters (0.8)

surfaces.js holds pattern/effect metadata and createSurfacePainter. Patterns cache
transformed, masked paths independently from opacity. Effects reuse a full-size
scratch layer and deterministic particle paths. surface-ui.js validates new fields,
populates grouped selectors and lazy preview galleries, and manages resets and
quick actions. It is UI-only and is not included in exported HTML.

holographic.js defines eight presets and createHolographicPainter. WebGL is created
lazily only for an enabled finish. Compilation/context failures switch to the CPU
path, as does context loss. CPU and shader palettes share the same formulas. The
factory contains all its shader and render code and is serialized with the surface,
texture and theme painters. There is no dependency on external metadata at export
runtime. Higher-resolution static scene exports use the controller's standard
1672×1241 canvas, with the finish interpolated from its cached render target.

Version-1 projects gain validated pattern, effect-detail and holographic fields.
Legacy checker opacity/ink is retained; holoEnabled defaults false. Applying anime
presets resets their pattern/effect-detail defaults but preserves the finish and
texture. Fixed external-link IPC supports the supplied holographic reference only.

surfaces-holographic-test.cjs covers every pattern and shell effect, all finish
presets, controls/transparency protection, motion/freeze, CPU fallback, transforms,
custom ink, migration/validation, grouped selectors, gallery search, stepping,
reset/Undo, preserved finishes across anime presets, save/reopen and offline export.
Set STUDIO_URL to the local app server. tools/capture-surface-review.cjs produces
preview figures from the actual renderer. Physical controller/OBS and a range of
Windows graphics-driver configurations still require hardware validation.

## Held local editor polish (0.8.1 candidate)

See REVIEW-QOL.md for the review and validation record. editor-ux.js owns editor
history sessions, action readiness/busy states, panel scrolling, preview feedback,
autosave scheduling and OBS publication status. It is UI-only and is excluded from
the standalone HTML runtime. Renderer/texture image replacement keeps the last
valid image and commits only the latest decoded request. The later input/lifecycle passes are recorded in REVIEW-INPUTS.md and
REVIEW-LIFECYCLE.md. It has not been pushed or released.

## Held local setup flow

See REVIEW-SETUP.md. setup.js owns saved input-source selection, first-use help
preferences and desktop bridge status polling. main.cjs/preload.cjs expose readonly
getSetupState and fixed-port retryBridge methods. No arbitrary URL/port is accepted.
The bridge preserves its existing URL and saved HTML path; publication checks
readiness before writing. Polling reports an overlay-page connection rather than
asserting client identity. setup-flow-test.cjs and setup-bridge-test.cjs cover the
complete setup and recovery paths. No release was triggered for this work.

## Release-candidate completion

lifecycle.js samples/forwards input, handles page/device interruptions and owns
renderer loading/retry. Editor-only setup and history helpers are not serialized
into standalone HTML. Artwork decoding follows the active artwork/texture mode;
unused embedded source images remain in project data without blocking exports.

main.cjs writes OBS HTML and native exports to a temporary file in the destination
folder, then renames it. Failed writes/replacements preserve the prior file and
live overlay. A failed saved-overlay read reports a recoverable setup warning.
New SSE clients receive the current sampled state immediately, with a one-second
freshness check before replay. Existing source geometry and standard mapping are
unchanged. Application/package identity remains stable to retain user data.

release-flow-test.cjs covers artwork switching, inactive damaged assets, HTML/PNG,
script-safe Unicode round trips and setup warnings. release-native-test.cjs covers
write/rename/read failures, cleanup, saved/live consistency and fresh SSE replay.

## Internal production and customer delivery

production.js owns job metadata, live-signal observations, handoff gates and the
native delivery UI. input-audit.js records physical signals only. customer-runtime.js
is serialized only for customer exports; existing studio exports keep the SSE
path. overlayHTML(true) selects direct customer input. The project name is now
validated/restored and used for filenames; existing version-1 projects retain
appearance and legacy font selection. Fresh jobs use the included Rajdhani font.

main.cjs/preload expose fixed delivery methods backed by github-delivery.cjs.
The backend uploads versioned HTML to Controlverlay-Farm, saves editable backups
only under userData, encrypts the GitHub token with protected OS storage and never
forwards it to public hosting. The connected HTTPS host is independent of GitHub
Pages; Cloudflare Pages Free with Git integration is the documented business route.
Only Contents read/write access is required. Native tests fake external requests;
no real token, customer upload or Cloudflare deployment was used during checks.
The farm repository itself was initialized through the user's GitHub connection.

Read PRODUCTION-WORKFLOW.md for the operator workflow and remaining acceptance
gates. Public customer URLs require the owner's one-time hosting/account setup.

Repository-first delivery permits an empty hostBase. Stored records have status
stored, a repository path and no customer URL. Adding hosting later assigns URLs
to pending records without GitHub PUTs and permits reusing the saved token only
for the same repository. Existing hosted records retain their URLs. Deployment
checks reject text/plain downloads even when their bytes match the export.
