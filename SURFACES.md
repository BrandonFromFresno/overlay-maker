# Patterns, effects and holographic finishes (0.11)

## Pattern picker

20 patterns plus None, grouped in the native dropdown. Previous/Next cycles through
choices, and Browse pattern previews opens a searchable gallery. Adjust strength,
scale, angle, weight (outlined styles), accent/custom ink and, for camouflage,
repeatable surface variations. Subtle/Balanced/Bold are strength shortcuts. Reset
preserves the selected pattern and all other layers. Each action supports Undo.

Existing designs have cleaner checkers, coherent cloud curls, spaced stars, a
connected honeycomb, staggered halftone, racing slashes and a split panel. Additional
patterns are Ocean waves, Hemp-leaf geometry, Seven treasures, Circuit board,
Carbon twill, Contour lines, Chevrons, Pinstripes, Diamond lattice, Dragon scales,
Camouflage, Manga sunburst and Key maze.

A legacy checker project keeps dark ink and .65 strength when its new settings
are absent. Other old patterns default to .24 strength. Anime presets normalize
pattern settings for their intended look, preserving the independent finish and
texture. The Water Breath checker remains dark over its green base.

## Effects picker

18 current effects plus None. Previous/Next and the searchable gallery use the same
catalog, with actual controller still previews. Groups include Accents, Input,
Energy, Manga, Particles, Light and Atmosphere. Intensity and motion pace remain
editable; applicable shell effects support Density, Direction and Glow softness.
Controls that do not apply are disabled. Reset supports Undo.

Original stylized fire and curling smoke replace Halftone Pulse and Scanner Lines
in new choices. Saved jobs keep either retired effect, with an inline notice;
import, Undo and export retain their appearance until the producer chooses a
replacement. Static halftone shell patterns are unaffected.

Particle lifetimes have eased entry/exit, independent speeds and directional trails.
Branching lightning interpolates between coherent poses. Aura/silk ribbons, spiral
arms, waves and sweeps use controlled tapered shapes. Rainbow, Neon pulse and
Reactive flash retain immediate input behavior, including plain native skins.
Full/Reduced/Still motion applies to effects. See [VFX-QUALITY.md](VFX-QUALITY.md).

## hhholographic analysis and implementation

The supplied [fffuel hhholographic](https://www.fffuel.co/hhholographic/) page is a
live WebGL/GLSL background generator. Its four main controls are Zoom level (1–20),
Color washout (0–.9), White mix (0–.9) and Complexity (.7–1.5). It exports JPG, WebP
and PNG in several aspect ratios and credits GlslCanvas and Lewis Lepton. It differs
from the photographic tttexture collection analyzed in TEXTURES.md.

The Holographic tab implements an original offline liquid-field renderer and these
four controls, plus finish strength, hue, blend, seed variation and optional motion. Hue rotates
the actual palette in both graphics paths. Hue and washout are disabled for neutral
chrome, where color adjustments do not apply.
It does not embed the website, copy its shader, use GlslCanvas, fetch external assets
or redistribute website-generated images. The reference can be opened in a browser
through a fixed desktop link.

Eight finish presets: Liquid spectrum, Pearl silk, Liquid chrome, Oil slick, Aurora
foil, Candy glass, Golden alloy and Opal mist. Choosing a preset enables the finish.
The checkbox disables it without losing settings. Reset restores the selected
finish; Undo restores prior settings. Animate liquid finish can be disabled without
stopping the other effects. Still mode freezes all motion while inputs still work.

Graphics acceleration uses an original WebGL shader at 768×432, composited into the
1672×941 shell. Systems without WebGL or after context loss use a deterministic
288×162 CPU fallback. The GPU evaluates presentation timestamps; the CPU fallback interpolates between
20 Hz field samples on every presentation frame. Still mode and Animate off freeze
the field. Context loss falls back to CPU; restoration retries WebGL. Both paths use
the same liquid-field and palette formulas. Fine numerical/interpolation differences
between graphics backends are expected. The fixed output aspect fits the controller;
this is not a standalone general-purpose background exporter.

## Layering and offline use

Order: shell base → holographic finish → abstract waves → texture → pattern → shell effects/theme
engraving → artwork → control faces/stick caps. Surface layers all use the same
protected shell mask. They cannot recolor buttons, sticks, bumpers or triggers,
and do not fill transparent background. Artwork and per-control colors remain
independent. Individual pressed states retain the existing feedback.

Projects embed settings; HTML/OBS exports embed the painters and any selected local
texture. No network or reference website is needed to render the finish. PNG captures
the composite at a fixed timestamp. Republish and refresh an existing OBS source to
use an edited design. Old project files open with holographic finishes off.

[Patterns, effects and finish samples](docs/surfaces-holographic-preview.png) ·
[Holographic tab](docs/holographic-editor-preview.png)
