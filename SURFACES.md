# Patterns, effects and holographic finishes (0.8)

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

18 effects plus None. The effect picker now appears before anime signature parts.
The dropdown groups Accents, Input, Energy, Manga, Particles, Light and Technical.
Previous/Next, searchable still previews, descriptions and Reset are available.
Intensity and motion pace remain editable; shell animations gain Density, Direction
and Glow softness. Controls that do not apply to a selection are disabled.

Lightning follows continuous curves, waves fade with distance, speed lines and
particles fade at travel boundaries, and aura has layered ribbons. The additions
are Fireflies, Neon rain, Snowfall, Comet trails, Scanner lines, Spiral vortex,
Prism rays and Silk flow. Rainbow accents, Neon pulse and Reactive input flash keep
their existing roles. Full/Reduced/Still motion applies to the expanded set.

## hhholographic analysis and implementation

The supplied [fffuel hhholographic](https://www.fffuel.co/hhholographic/) page is a
live WebGL/GLSL background generator. Its four main controls are Zoom level (1–20),
Color washout (0–.9), White mix (0–.9) and Complexity (.7–1.5). It exports JPG, WebP
and PNG in several aspect ratios and credits GlslCanvas and Lewis Lepton. It differs
from the photographic tttexture collection analyzed in TEXTURES.md.

The Holographic tab implements an original offline liquid-field renderer and these
four controls, plus finish strength, hue, blend, seed variation and optional motion.
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
288×162 CPU fallback. The render cache refreshes moving fields at most every 80ms,
while opacity/blend and live controls continue rendering normally. Both paths use
the same liquid-field and palette formulas. Fine numerical/interpolation differences
between graphics backends are expected. The fixed output aspect fits the controller;
this is not a standalone general-purpose background exporter.

## Layering and offline use

Order: shell base → holographic finish → texture → pattern → shell effects/theme
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
