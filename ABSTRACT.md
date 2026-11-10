# Default overlay and abstract waves — 0.11.0

Reviewed November 10, 2026 (America/Los_Angeles).

## Returning to the default overlay

The former reset kept the selected native skin. It remains available as
**Project options → Reset to selected skin**. The new, separate action is
**Shell → Use default overlay**: it removes the skin/template, artwork, custom
colors, surface layers and effects, returns to Live input and preserves the
customer/job name. Undo restores the complete previous design, including embedded
images. No confirmation dialog or project-schema change was added.

The opening gallery also has **Start without a template**. It previews the neutral
existing G7 artwork without modifying or autosaving the open job. Choose
**Use Default overlay** to apply, or continue the current job. The 13 supplied
GameSir skins and their isolated preview/apply behavior remain available.

The default uses the established Studio artwork, with no added wordmark or effects.
It does not remove faint reference marks baked into that supplied source image.

## Reference assessment

[fffuel aaabstract](https://www.fffuel.co/aaabstract/) was inspected in HTML and
Chromium. It makes animated, soft, flowing abstract backgrounds using WebGL and
GlslCanvas. Its controls are Complexity (2–30), saturation (.1–6), distortion
(0–30), Color mixture (UI .2–15, initial value 0), Light/Dark and JPG/WebP/PNG
snapshot exports, with square, 4:5 and 16:9 output ratios.

This implementation supplies original wave/fold field equations, palette mixing
and compositing code. It does not embed the page, copy its shader, use GlslCanvas,
fetch external resources or distribute site-generated images. The fixed reference
button opens the site in the system browser in Windows.

## Production workflow

**Abstract** sits beside Holographic and Textures in the existing keyboard-navigable
inspector. Enable the layer, choose Silk waves, Folded bloom or Deep tide, then
adjust complexity, distortion, saturation, color mixture, Light/Dark and strength.
Color, zoom, angle, repeatable variation, saved frame and motion cycle are under
**Color, position & motion**. Static is the default. Turning the layer off preserves
its settings. Reset changes only the abstract settings; edits support grouped Undo.

Color follows the accent or a custom wave color. Optional animation uses absolute
time; Reduced mode slows it, and Still pauses it without delaying controller input.
**Freeze current frame** stores the displayed phase so that a chosen look persists
across refreshes and exports. The saved-frame slider can refine that still or the
animation offset. The CPU fallback interpolates 20 Hz field samples at presentation
time and invalidates its sample cache after a static frame, preventing stale
motion when animation resumes. WebGL context loss falls back to software and
restoration retries acceleration.

Layer order: shell → Holographic → Abstract → Textures → patterns/effects/themes
→ artwork → controls. The shared shell mask protects buttons, sticks, shoulders,
triggers and transparent background. Full-strength Abstract can cover underlying
skin/holographic color; reduce strength to mix them. The output is the existing
1672 × 1241 transparent controller overlay, rather than a general background maker.

Settings save in the existing version-1 project, including autosave and reusable
customer backups. Old files load with Abstract off. PNG stills, local OBS test HTML
and standalone customer HTML include the renderer; customers install nothing.
Existing delivered URLs are unchanged until a new customer export is uploaded.

## Checks and limits

`abstract-workflow-test.cjs` covers default preview without mutation, applying the
neutral overlay, native-to-default reset, job-name retention, Undo, controls and
starting looks, freeze, saved restoration, invalid-setting rejection, old-project
migration, all three styles on native/legacy artwork, sampled control protection,
transparent alpha, input/release response, CPU interpolation/loop/resume, simulated graphics-context recovery, responsive
widths and standalone customer rendering. Other suites cover existing setup,
gallery, delivery, controls, textures and effects. Captures use the actual renderer;
`tools/capture-abstract-review.cjs` regenerates them.

Software rendering trades resolution for smooth presentation; fine edges can differ
from WebGL. Headless checks do not establish actual Windows/OBS performance or
physical mapping. Hardware/streaming-app acceptance remains required.

[Controller looks](docs/abstract-looks-0.11.png) · [Abstract panel](docs/abstract-panel-0.11.png)
