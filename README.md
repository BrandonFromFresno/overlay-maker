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

## Customize your design

Use the sections on the left: **Shell**, **Buttons**, **Artwork**, **Effects**, **Layout** and **Presets**. Only the section you need is shown. In Buttons, click a control on the preview to select it. Fine position and ambient settings stay under expandable controls. **Export & OBS** opens the export/setup dialog.

Artwork includes eight offline fonts: Rajdhani, Orbitron, Oxanium, Teko, Bebas Neue, Barlow Condensed, Montserrat and Inter. Choose **Fonts on this computer** to browse installed Windows font families. Included fonts are embedded in exported HTML; system fonts must be installed on the computer displaying the overlay. The original system font is retained when opening older projects.

## Included

- Neutral starting design, custom text and PNG/JPEG logo import.
- Optional Cudi reference preset under Reference presets.
- Drag-to-move controller positioning, separate artwork dragging, centering and keyboard nudges.
- Shell-only color, independent button defaults, accent colors, breathing glow and input previews.
- Individual resting and pressed colors for every button, D-pad direction, stick cap and trigger.
- Ten animated effects, including aura, waves, lightning, speed lines, embers, halftone and energy sweep.
- Sixteen editable anime-inspired presets and seven shell patterns.
- Shell tint, patterns and shell effects stay separate from physical controls.
- Clean vector Home pressed emblem and complete, seam-aligned LB/RB colors.
- Red/charcoal interface with a focused inspector, keyboard navigation and one export dialog.
- Curated offline font library plus Windows installed-font discovery.
- Project files, autosave, undo/redo, HTML and transparent PNG export.
- Standard gamepad input forwarded to OBS through a local bridge.

Use **Export & OBS → Create / update OBS URL** and add `http://127.0.0.1:18777/overlay` as a Browser Source at **1672 × 1241**. Keep the editor running. After publishing changes, refresh the OBS source.

## Early build status

Browser editor/export tests and a mocked desktop bridge test passed in the development environment. The GitHub workflow checks syntax, tests the bridge, and packages the Windows app. Physical G7 8K input, focus/background behavior and actual OBS capture still need Windows testing. M and vendor-specific buttons are not mapped. Shell and button colors stay independent while retaining the underlying texture; the supplied shell still includes faint baked Cudi artwork, so a clean base asset is needed to remove that trace completely. This is an unsigned early build.

## Development

Install Node.js 22+, then run `npm ci` and `npm start`. Build a Windows ZIP with `npm run build:win`. See [DEVELOPMENT.md](DEVELOPMENT.md) for architecture and provenance.

The Cudi artwork was supplied for this project. No license granting public reuse or redistribution of the artwork is asserted.

The interface is independently built, with visual direction inspired by [GameSir](https://gamesir.com/). Overlay Studio is not an official GameSir application. Included font sources and redistribution licenses are in [app/fonts/licenses](app/fonts/licenses).

## Anime presets and independent shell color

**Presets** has 18 anime-inspired designs with rendered previews and search. Each
applies themed ABXY artwork, a Home emblem, shell details, palette, font and effect. **Include preset wordmark**
replaces the artwork; uncheck it to retain your text/logo and font settings.
Controller position stays in place. Preset wordmarks include a small grip-title
placement; disable that option to preserve your artwork and its layout. Applying
a preset is one Undo step. Effects lets you mix theme parts independently, enable
press-triggered energy rings and choose Full, Reduced or Still motion.
See [PRESETS.md](PRESETS.md) for the full list.

**Shell → Shell color** affects only the housing. **Buttons → All-button defaults**
controls the default resting/pressed colors independently; individual overrides
still take priority. On upgrading an older project, its previous default button
color is retained so subsequent shell edits cannot change the controls.

After updating a published overlay, create/update the OBS URL again and refresh
the browser source. The older exported HTML does not update itself.

[View the new theme artwork](docs/anime-theme-preview.png).

## Signature polish and textures (0.7)

The 18 anime themes now include more specific motifs: straw hats, Hell Butterflies,
hunter badges, ladybugs, kaiju masks and round glasses, with contrast-safe button
ink. Presets adds favorites, a demo, source-theme tracking and Restore theme look.
Keep my shell & button colors preserves custom palettes when switching designs.
See [PRESETS.md](PRESETS.md).

**Textures** adds eight offline finishes and a personal JPG/PNG library for images
from [fffuel tttexture](https://www.fffuel.co/tttexture/) or your own artwork.
Choose strength, blend, inversion, monochrome, scale and rotation. The collection's
license prohibits redistributing its images, so those photographs are imported
locally rather than bundled. See [TEXTURES.md](TEXTURES.md) for the source analysis,
license, import limits and offline export behavior.

## Expanded patterns, effects and holographic finishes (0.8)

Shell has 20 polished patterns with grouped selection, searchable previews and
strength/scale/angle/ink controls. Effects has 18 choices with previews, improved
motion, density/direction/softness controls and per-section reset. None is available
in both pickers.

The new **Holographic** tab adds eight original offline liquid/iridescent finishes,
inspired by [fffuel hhholographic](https://www.fffuel.co/hhholographic/). Adjust zoom,
complexity, washout, white mix, hue, blend and motion. It has a software fallback,
works in exports, and preserves controls. Textures and patterns layer over the finish.
See [SURFACES.md](SURFACES.md) for the reference analysis, complete option lists,
layer order and compatibility details.
