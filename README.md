# Overlay Studio

An offline Windows editor for GameSir G7 8K stream overlays, with an editable neutral starting design.

## Download the Windows app

1. Open this repository’s **Actions** tab.
2. Open the latest successful **Build Windows app** run.
3. Under **Artifacts**, download **Overlay-Studio-Windows-x64** (GitHub sign-in required).
4. Extract the downloaded artifact, then extract the Windows ZIP inside it.
5. Open **Overlay Studio.exe**, keeping the adjacent files and folders together.

No Node.js, account, or internet connection is required to run the downloaded app.
See [START-HERE.txt](START-HERE.txt) for OBS setup and input limitations.

## Included

- Neutral starting design, custom text and PNG/JPEG logo import.
- Optional Cudi reference preset under Reference presets.
- Drag-to-move controller positioning, separate artwork dragging, centering and keyboard nudges.
- Gamepad base color, accent and pressed-input colors, breathing glow and input previews.
- Project files, autosave, undo/redo, HTML and transparent PNG export.
- Standard gamepad input forwarded to OBS through a local bridge.

Use **Send to OBS** and add `http://127.0.0.1:18777/overlay` as a Browser Source at **1672 × 1241**. Keep the editor running. After publishing changes, refresh the OBS source.

## Early build status

Browser editor/export tests and a mocked desktop bridge test passed in the development environment. The GitHub workflow checks syntax, tests the bridge, and packages the Windows app. Physical G7 8K input, focus/background behavior and actual OBS capture still need Windows testing. M and vendor-specific buttons are not mapped. Base color tints the original shell and controls while retaining the underlying texture; the supplied shell still includes faint baked Cudi artwork, so a clean base asset is needed to remove that trace completely. This is an unsigned early build.

## Development

Install Node.js 22+, then run `npm ci` and `npm start`. Build a Windows ZIP with `npm run build:win`. See [DEVELOPMENT.md](DEVELOPMENT.md) for architecture and provenance.

The Cudi artwork was supplied for this project. No license granting public reuse or redistribution of the artwork is asserted.
