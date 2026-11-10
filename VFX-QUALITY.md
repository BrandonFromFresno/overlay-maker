# Original VFX quality review — 0.10.0

Reviewed November 9, 2026 (America/Los_Angeles). This is a visual and technical
refinement of the current G7 production workflow, without new device support.

## Reference and provenance

ActionVFX is a quality reference only. Its collection returned HTTP 403 in this
workspace, including a browser attempt. A direct visual equivalence or superiority
claim cannot be substantiated here. No ActionVFX footage, artwork, frames or code
was used. The replacement effects and materials are original procedural/vector
work, guided by the requested continuity, silhouette, compositing and timing criteria.

## Audit and completed work

| Existing family | Refinement |
| --- | --- |
| Embers, fireflies, snow, rain, comets | Independent deterministic lifetimes, smooth entry/exit, directional trails, controlled density and bounded glow sprites. |
| Lightning | Interpolated branching poses, restrained layered cores, continuous intensity instead of random-frame flicker. |
| Aura, silk, vortex, speed lines, waves | Filled/tapered ribbons and arms, eased travel, soft expansion/decay and controlled secondary detail. |
| Sweeps and prism light | Matched-color transparent edges, gradual entry/exit and continuous motion. |
| Anime fire and soul energy | Coherent layered flame silhouettes, directional deformation, billowing smoke and ember accents; original fire/smoke are also standalone options. |
| Rainbow, Neon and reactive feedback | Smooth color/pulse envelopes, cached fixed-radius glow, immediate input flash; accents work on plain native skins without text. |
| Theme bursts | Smooth activation, eased expanding rings and directional sparks. Stick-click bursts originate outside the stationary socket. |
| Home and ABXY swaps | All 26 Home treatments and 16 ABXY families rebuilt as filled vector/material art: 90 actual variants. Spherical amber star buttons, layered chakra orb, precise iris/tomoe and clean silhouette emblems replace sketch lines. |
| Holographic finishes | Removed 80 ms presentation cap; GPU uses current timestamps, CPU blends 20 Hz samples every presentation frame. Softened highlights, bounded phase, recoverable context loss and explicit still/animate-off behavior. |
| Source lighting and controller layers | Cached native-resolution SVG rasterization, artwork and emissive layers; small dedicated trigger buffer. Source assets and input geometry are unchanged. |
| UI interaction | Existing restrained UI transitions retained; effect choices now preview the actual controller, with consistent descriptions, resets and applicable-control states. |

No standalone explosion system existed to repair. No footage dependency or new
external asset loading was introduced. All new runtime factories are embedded in
standalone customer HTML and work offline.

[Rendered controller samples](docs/vfx-material-review-0.10.jpg) ·
[Home material atlas](docs/home-materials-0.10.png)

## Retirement and saved work

Halftone Pulse and Scanner Lines leave the new-effect dropdown/gallery. Their old
IDs and compatibility painters remain for imported projects, Undo and exports;
retirement is explained inline instead of silently altering a customer job.
Golden Wind now selects the refined sweep. Static halftone patterns remain.

Project format stays version 1. A rendering revision marker prevents an older
customer URL from being represented as matching a newly improved preview: the
editable job restores, but the producer must re-export before handoff. Existing
published HTML is self-contained and is not changed by installing this version.

## Verification and limits

`vfx-quality-test.cjs` checks cycle-boundary continuity, motion on plain native
skins, all 90 button variants with press/release and corner containment,
30/60 Hz history independence, artwork-cache invalidation, CPU interpolation,
still freeze, context-loss recovery and retired-project round trips. Existing
input/native-skin suites cover full stick travel, buttons, triggers, exports and
protected layers. These are measurable regression checks, not an automatic
assessment of artistic quality. Actual rendered multi-frame contact sheets and
a complete Home/ABXY material atlas were also inspected during development.

The neutral legacy scene's median CPU submission time fell from about 63 ms to
under 1 ms in the same headless Chromium environment after SVG/trigger/artwork
cache changes. The isolated profile measured fire at 16.5 ms median / 18.9 ms p95, smoke at
16.7 / 20.6 ms, and CPU holography at 12.7 / 23.9 ms. Other individual effects
were below 16.7 ms at p95; combinations can exceed that budget. Headless timings are not presented FPS, Windows hardware benchmarks or a
promise of 60 FPS. Reduced/Still modes remain available. Tools for repeatable
captures and profiling are in `tools/capture-vfx-review.cjs`,
`tools/capture-button-materials.cjs` and `tools/benchmark-vfx.cjs`.

Remaining acceptance: real Windows executable launch, physical-controller input
and Home exposure, focus/minimize behavior, long-session graphics behavior and
actual OBS/Streamlabs capture/performance. The release remains a prerelease.
