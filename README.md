# Overlay Studio

Internal Windows production tool for creating, testing and delivering controller customer overlays. Version 0.15.0 is a **Windows prerelease** for producer acceptance testing. Physical-controller and target-app validation limits are documented below.

## Run the Windows app

Download [Overlay-Studio-Windows-x64.zip](https://github.com/BrandonFromFresno/overlay-maker/releases/download/v0.15.0/Overlay-Studio-Windows-x64.zip) from the [0.15.0 prerelease](https://github.com/BrandonFromFresno/overlay-maker/releases/tag/v0.15.0). Extract the entire ZIP, then open **Overlay Studio.exe**. Keep the adjacent files together. The ZIP includes [START-HERE.txt](START-HERE.txt).

The extracted app needs no account, Node.js, internet connection or GameSir server. Connect a browser-standard gamepad, focus the app and press a button. Live preview starts automatically. Connection feedback, the input-device picker and setup help are below the preview.

## Production workspace and GameSir skin gallery

The app opens with 22 visual families and 60 supplied skins, including the original 13 G7 Pro 8K designs, live previews and safe saved-job resume. Choose **Start without a template** for the neutral overlay. In the editor, **Shell → Use default overlay** restores the current visual model’s default appearance while keeping the job name; Undo restores the previous design. **Project options → Reset to selected skin** remains a separate action. Selected skins persist in projects and are embedded in finished customer overlays. New layouts retain supplied geometry in data packages with high-resolution transparent artwork; existing Studio projects retain their artwork. See [opening-gallery review](REVIEW-START-SCREEN.md). The preview is centered between a compact tool rail and a contextual inspector. Job naming stays in the header; movement and verification controls are above the canvas. Customer delivery and studio testing have distinct areas.

## Easier navigation and customer setup

Use **Find a tool** (Ctrl+K / Command+K or F1) to search tasks and jump to their controls. **Try input demo** works without a controller and stays separate from live verification. **Export & OBS → Preview customer experience** opens the customer setup page locally in the Windows app, without GitHub setup.

New customer handoffs include a setup-guide link with live controller feedback, a copyable clean OBS URL and dimensions. The normal URL stays transparent and menu-free. Both views use the same exported HTML, with no customer installation or account. See [customer experience and review workflow](CUSTOMER-EXPERIENCE.md).

## Joystick styles from the reference recording

**Effects → Joystick movement & trails** adds **Tilt**, **Both** and **Trail**, Short/Medium/Long fading paths and red/white/cyan/yellow or custom colors. Tilt preserves the existing cap movement. Both adds a trace; Trail keeps the cap centered and uses a live position marker. Sockets and rims stay fixed. Settings save with the job and are embedded in customer overlays. See [joystick behavior and verification](STICK-VISUALIZATION.md).

## Comic Gunfire FX

**Effects → Right trigger · Comic Gunfire FX** adds original layered BANG!, ZAP!, BOOM! and POW! bursts to RT / R2. Choose a word or shuffled random mode, adjust size and duration, and optionally hold to repeat. Advanced settings cover placement, intensity, rotation, activation threshold, repeat interval and the active-burst limit. **Preview RT** simulates a press or short hold without forwarding it to OBS; select Live controller for hardware testing.

The animation uses crisp font-independent vectors, separate lettering/burst/cloud/accent motion and true alpha. Placement fits the entire animated envelope into clear space near RT; when trigger gauges occupy the available headroom, it uses adjacent space and reports the fitted size. Old projects keep this optional effect off. Graphics and behavior are embedded in customer and studio exports, with no additional downloads. See [comic quality and implementation review](COMIC-GUNFIRE.md).

## Make an overlay

- **Shell** controls housing color, accents and 20 patterns. **Buttons** has independent default and individual resting/pressed colors; click a control on the preview to select it.
- **Artwork** supports text, PNG/JPEG logos, eight included fonts and installed Windows font families. After trying text, **Use imported logo** restores the existing image without importing it again. The Cudi reference is optional.
- **Effects** contains 18 current effects plus None and independent theme treatments. Original fire/smoke, smoother particles and energy, and rebuilt button materials share the new rendering standard. Two retired effects remain compatible with saved jobs. See [VFX quality review](VFX-QUALITY.md). **Presets** has 18 searchable anime-inspired designs, favorites, demos and artwork/color preservation options. See [PRESETS.md](PRESETS.md).
- **Abstract** adds three original flowing-wave looks with complexity, distortion, saturation, color mixture, Light/Dark tones and an optional animated or frozen frame. It stays on the shell, works offline, and saves/exports with the job. See [ABSTRACT.md](ABSTRACT.md).
- **Textures** includes eight offline finishes and a private image library. **Holographic** adds eight original finishes with software fallback. See [TEXTURES.md](TEXTURES.md) and [SURFACES.md](SURFACES.md).
- Drag the preview to move the controller. Choose **Move artwork** to position text/logos separately. Arrow keys nudge; Shift moves 10 pixels. **Layout** provides precise placement and centering.
- Save an editable `.overlay` backup with embedded images. Autosave restores the design on this computer when storage is available. Undo/redo supports grouped edits. Ctrl+S saves; Ctrl+O opens; Ctrl+Z undoes; Ctrl+Shift+Z redoes.

Shell tint, patterns and shell effects remain separate from the controls. Stick sockets/rims stay fixed while caps move. Inputs, selected device and design settings have separate lifecycle handling; simulated previews are temporary.

Included fonts: Rajdhani, Orbitron, Oxanium, Teko, Bebas Neue, Barlow Condensed, Montserrat and Inter. Only the selected included family is embedded in HTML, with its license. System fonts must be installed on the displaying computer. Sources/licenses are in [app/fonts/licenses](app/fonts/licenses).

## Press and analog effects

**Effects → Button press & analog effects** adds four press bursts and four continuous responses driven by trigger depth or stick movement. Customize color, strength, size and burst duration; use each input’s pressed color for individual palettes. Settings save and export with the overlay. See [press effect controls and limits](PRESS-EFFECTS.md).

## Visual models

Templates now separates the visual model from the connected gamepad. Choose from 22 source-backed visual families and 60 skins; any browser-standard gamepad can drive any layout. Saved jobs retain their model. See [controller models, audit and limitations](CONTROLLER-MODELS.md).

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
