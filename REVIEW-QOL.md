# Local quality-of-life review — candidate 0.8.1

Status: changes are held locally pending further instructions. No GitHub push,
release publication or CI release build was performed for this candidate.

## Findings and implemented fixes

| Rough edge | Result |
|---|---|
| Focus created hidden Undo entries; focused selectors grouped unrelated choices; redo was cleared too easily | Actual edits create history, continuous gestures group, selector choices stay separate, no-op actions preserve Redo, and canceled drags restore both stacks |
| Numeric fields committed empty/minus intermediates as zero | Partial numeric input remains editable; the last valid value is restored on blur |
| Fast last keystrokes depended on a blur to autosave | Debounced autosave writes the final edit; pending writes flush before unload; storage failures now produce a visible warning with the Save project fallback |
| Demo switches left old trigger percentages/button highlights behind | Shared reset/sync updates all manual indicators; mode buttons expose selected state; status distinguishes rest, simulated demo and physical live input |
| Import said to drag a logo while the active target was the controller | Successful logo import selects artwork dragging and a persistent canvas caption identifies the active target |
| Switching tabs discarded scroll positions; theme shortcuts opened generic effects at the top | Each panel remembers its scroll position; theme editing scrolls to and focuses the relevant artwork selector |
| No busy, cancellation or consistent failure handling for file/export actions | Actions lock competing edits until completion, block duplicates and restore controls/focus on success, cancellation or failure; loading controls start disabled |
| Failed logo decode could leave a blank, falsely cached asset | Logo and texture replacement are atomic, failures can be retried, and only the latest request can commit an image |
| OBS output appeared current after edits | Session publication state distinguishes unsent/current/changed designs, Copy requires a valid URL, and refresh guidance stays visible |
| Export controls were below lengthy setup instructions | Instructions are collapsible and normal export actions are easier to reach |
| Long status messages were clipped; secondary controls varied in size | Status messages wrap/scroll, severity has readable text and color, and secondary controls have consistent minimum target sizes |
| Texture batches silently ignored files beyond twenty | Import progress and batch-limit/partial-failure feedback now describe what was processed; library removal blocks duplicate clicks |

Ctrl+S / Ctrl+O invoke the existing project actions. Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
invoke design history while native text-field undo remains available.

## Preserved scope

Controller assets, shading geometry, button shapes, shader/effect algorithms,
standard gamepad mapping, polling and physical-input forwarding are unchanged.
Renderer changes are limited to asynchronous asset replacement. No controller
model, preset, effect, pattern or finish was added. Browser-only OBS limitations
are explained inline. The paused controller-gallery/Tarantula work stays paused.

## Verification

Use a local app server and set STUDIO_URL for browser tests. The focused
editor-qol-test.cjs checks meaningful history, partial number entry, autosave quota
feedback, preview-state consistency, panel navigation, atomic/retryable/latest-wins
assets, invalid project recovery, delayed/canceled/failed saves, duplicate-action
prevention, keyboard actions, OBS stale/current feedback, drag-target feedback,
responsive dialogs and physical-input forwarding during busy actions.

The nine existing suites were also run: positioning, colors/effects, fonts/shoulders,
textures/presets, anime themes, surfaces/holographic, shell/presets, smoke and the
mocked native bridge. Syntax and diff checks accompany the behavioral tests.

## Remaining attention

Actual Windows native file dialogs, focus/background gamepad behavior and physical
G7-to-OBS capture still need hardware validation. Autosave remains subject to local
storage limits; large projects should be saved to a project file, with a visible
warning if automatic storage is unavailable. The established source artwork is
preserved, including its existing faint reference-art limitation.
