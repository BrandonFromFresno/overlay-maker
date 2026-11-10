# Production UI review — 0.9.0

The supplied design brief and GameSir assets informed this pass. The visual system retains charcoal surfaces, off-white text, restrained GameSir red, simple geometry and precise vector icons. The interface uses shared tokens for colors, control heights, typography, spacing, radii, borders and interaction states. No framework, runtime dependency, decorative animation or controller-renderer change was introduced for the UI redesign.

## Completed changes

- Centered the controller between the tool rail and a right-hand contextual inspector. Removed repeated page/device headings from the editor. The inspector opens directly on the active tool's controls.
- Moved the actual customer/job field into the persistent header. It remains autosaved and is disabled during file/export operations. There is a single field and a single project state.
- Moved the existing controller/artwork movement switch above the preview. Choosing a movement target no longer requires opening Layout. Precise coordinates remain available there.
- Added a Verify inputs shortcut that expands the physical input check and focuses its Start button without starting observations automatically.
- Kept controller selection, physical verification and simulated inputs in one compact workbench below the canvas. Setup help is available there, collapsed by default; existing saved help preferences still restore.
- Added skin filtering, a result count, no-match feedback and an Escape/clear path to the native launch gallery. Selection remains separate from applying a skin. Launch actions remain visible while thumbnails scroll.
- Made customer delivery the primary area of a two-column dialog, with producer-only OBS testing and exports in a distinct column. Compact windows stack both areas. No actions or delivery gates were removed.
- Separated quiet autosave feedback from the status live region. Connection indicators now distinguish waiting, physical live input and simulation. Loading recovery remains visible on the gallery even while editing actions are hidden.
- Consolidated the stylesheet into documented component sections with shared design tokens. Added consistent 1.7 px SVG utility icons, focus outlines, hover/pressed states and reduced-motion support. No artwork, input mapping, saved project format, app identity or delivery credentials were changed by the UI pass.

## Verification and publication

The dedicated workspace suite checks search/no-match/recovery, isolated selection, central-preview layout, header autosave and busy locking, movement, verification focus, help preference restoration, independent status feedback, modal focus return and responsive editor/gallery/delivery widths. Existing regression suites protect project editing, inputs, native skins, effects, fonts, exports, bridge behavior and customer delivery.

The Windows build workflow runs syntax checks and all 22 suites before packaging. The existing release workflow publishes only the Windows artifact from a passing build for the exact release source SHA. Publication was authorized by the user on November 9, 2026 (America/Los_Angeles).

Physical controller input, Windows focus/minimize behavior and actual OBS/Streamlabs use remain producer acceptance checks. This is a Windows prerelease; simulated browser tests are not a claim of physical hardware validation.
