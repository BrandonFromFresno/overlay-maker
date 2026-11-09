# Overlay Studio

Internal Windows production tool for creating, testing and delivering GameSir G7 8K customer overlays. Version 0.8.2 is a **Windows prerelease** for producer acceptance testing. Physical-controller and target-app validation limits are documented below.

## Run the Windows app

Download [Overlay-Studio-Windows-x64.zip](https://github.com/BrandonFromFresno/overlay-maker/releases/download/v0.8.2/Overlay-Studio-Windows-x64.zip) from the [0.8.2 prerelease](https://github.com/BrandonFromFresno/overlay-maker/releases/tag/v0.8.2). Extract the entire ZIP, then open **Overlay Studio.exe**. Keep the adjacent files together. The ZIP includes [START-HERE.txt](START-HERE.txt).

The extracted app needs no account, Node.js, internet connection or GameSir server. Connect the G7 in PC / XInput mode, focus the app and press a button. Live preview starts automatically. Connection feedback and the input-device picker are beside the preview.

## Make an overlay

- **Shell** controls housing color, accents and 20 patterns. **Buttons** has independent default and individual resting/pressed colors; click a control on the preview to select it.
- **Artwork** supports text, PNG/JPEG logos, eight included fonts and installed Windows font families. After trying text, **Use imported logo** restores the existing image without importing it again. The Cudi reference is optional.
- **Effects** contains 18 effects and independent theme treatments. **Presets** has 18 searchable anime-inspired designs, favorites, demos and artwork/color preservation options. See [PRESETS.md](PRESETS.md).
- **Textures** includes eight offline finishes and a private image library. **Holographic** adds eight original finishes with software fallback. See [TEXTURES.md](TEXTURES.md) and [SURFACES.md](SURFACES.md).
- Drag the preview to move the controller. Choose **Move artwork** to position text/logos separately. Arrow keys nudge; Shift moves 10 pixels. **Layout** provides precise placement and centering.
- Save an editable `.overlay` backup with embedded images. Autosave restores the design on this computer when storage is available. Undo/redo supports grouped edits. Ctrl+S saves; Ctrl+O opens; Ctrl+Z undoes; Ctrl+Shift+Z redoes.

Shell tint, patterns and shell effects remain separate from the controls. Stick sockets/rims stay fixed while caps move. Inputs, selected device and design settings have separate lifecycle handling; simulated previews are temporary.

Included fonts: Rajdhani, Orbitron, Oxanium, Teko, Bebas Neue, Barlow Condensed, Montserrat and Inter. Only the selected included family is embedded in HTML, with its license. System fonts must be installed on the displaying computer. Sources/licenses are in [app/fonts/licenses](app/fonts/licenses).

## Produce and deliver customer overlays

Name the customer/job, reuse a saved configuration, and build the design. **Verify customer inputs** tracks physical presses/releases, trigger depth, full stick travel and D-pad diagonals. Simulated previews do not count.

**Export & OBS → Customer delivery → Upload customer overlay** uploads the finished page to [Controlverlay-Farm](https://github.com/BrandonFromFresno/Controlverlay-Farm). Connect GitHub in the Windows app with a repository-scoped token; leave the hosting URL empty to upload to the repository now. Later, connect that same repository to **Cloudflare Pages Free** and save its HTTPS hosting URL without re-entering the saved token or re-uploading stored overlays. Tokens use protected Windows storage; customers never receive them. No paid plan, purchased domain, Cloudflare API token or customer account is required within free limits.

Uploads use versioned paths and save editable backups privately. The app verifies that the hosted bytes match the export before marking the URL live. Complete the physical-input observations and target OBS/Streamlabs test, then copy the generated handoff instructions. Customers add a single URL as a Browser Source; they do not install this application or assemble assets. New jobs use an included font, and customer export prevents unresolved system-font dependencies.

**Save customer HTML** creates the same self-contained page for an offline archive or other HTTPS host. The customer runtime reads the customer's controller directly and has no dependency on the studio bridge. See [PRODUCTION-WORKFLOW.md](PRODUCTION-WORKFLOW.md) for one-time setup, checks, capacity and delivery limits.

## Studio OBS testing

The local `http://127.0.0.1:18777/overlay` URL is for the production computer only. Use **Send design to OBS**, then add a Browser Source at 1672 × 1241 and keep the editor running. After editing, update and refresh the source. **Copy studio test URL** and **Export studio test HTML** are internal testing options, not customer handoff products. PNG export remains a transparent still at peak glow.

## Release status and limits

The candidate has browser coverage for editing, rendering, setup, lifecycle recovery, saved projects and standalone exports, plus native bridge/file-failure checks using a mocked Electron shell. See [RELEASE-READINESS.md](RELEASE-READINESS.md) for the current verification record and release gates.

Windows executable launch, physical G7 mapping, focus/minimize behavior and actual OBS capture still need final hardware validation. Home depends on Windows/browser exposure. Capture/M and vendor-only inputs remain preview-only. A selected device returning in a different browser slot requires reselection. Hard crashes can lose edits inside the autosave debounce window; OBS has a one-second stale-input fallback. This is an unsigned build.

The supplied base contains faint baked reference artwork; a clean source would remove it. This is a 2D template, not an editable 3D model. The Cudi assets were supplied for this project; no public redistribution license is asserted. Overlay Studio is independently built and is not an official GameSir application. The interface takes visual direction from [GameSir](https://gamesir.com/).

## Development and verification

Use Node.js 22 or later:

```sh
npm ci
npx playwright install chromium
npm run check
npm test
npm start
npm run build:win -- --publish never
```

`npm test` starts its own local server, runs native suites sequentially, and runs browser suites with at most two workers. `CHROMIUM_PATH` can select a system Chromium. `OVERLAY_TEST_OUTPUT` selects the artifact folder; otherwise it uses a temporary directory. To run specific checks: `npm test -- lifecycle-test.cjs release-flow-test.cjs`.

Close the desktop app before running bridge tests, which use port 18777.

The Windows workflow runs the same checks before packaging. See [DEVELOPMENT.md](DEVELOPMENT.md) for architecture and source provenance. The project schema and existing application identity remain unchanged to preserve saved configurations.
