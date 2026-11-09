# Local setup-flow refinement — held candidate

This work extends the held 0.8.1 quality-of-life candidate. Nothing has been pushed,
released or submitted to a release build.

## First-use path

1. The existing G7 8K artwork is already selected. The UI labels it as artwork;
   the current build has no other released controller template to choose.
2. Connect a controller and press a button while the window is focused. Preview
   now defaults to Live, so no separate mode-selection step is required.
3. Use Set up OBS in the guide, or the existing Export & OBS menu. Send the design, copy the URL, and add an OBS Browser
   Source. Leave Local file off and use width 1672, height 1241. No project-file save
   is required before this step. Keep the app open for physical input forwarding.

The ordinary export menu keeps detailed setup collapsed; the dedicated setup
shortcut opens it. The compact Quick setup guide opens for a fresh workspace and is collapsed for an
existing saved project. Users can hide/reopen it; this preference is stored separately
from the project. Returning users reach their existing design without a modal wizard.

## Connection and configuration controls

The input-device picker and Live mode remain visible and stay pinned when the
advanced testing area is scrolled. Simulation modes and manual
buttons/triggers share one Preview & test options disclosure. The picker defaults
to Auto (the first compatible standard-mapped gamepad, matching the previous input
source), and lists detected controllers explicitly. Unsupported modes are identified
and prompt PC/XInput mode. Explicit selection uses the session's index and device
identifier; disconnecting it produces neutral input, with no fallback to another pad.
Reconnect the selected device or choose Auto. Device selection is session-local and
is not embedded into a portable overlay project.

Selecting a device, showing tips or opening setup does not change project data or
create Undo steps. Reset design and opening a project clear simulated inputs and
return to Live. Reset remains reversible through Undo; it keeps the selected input
device and does not reopen dismissed tips.

## OBS readiness and recovery

The desktop API now reports whether the loopback service is ready, whether a prior
overlay exists, and how many overlay pages are connected. Existing saved live.html
is retained. The UI distinguishes a previous overlay from this session's current or
changed design and restores its usable URL without pretending it matches the editor.

Publication and copying are disabled while the local bridge is unavailable. A port
conflict explains that other copies should be closed, and Retry local connection
rebinds without restarting the editor. Publishing cannot report success before the
server listens. Memory content is updated only after its disk write succeeds.

Overlay page connected means a page has connected to the local input stream; it is
not a claim that OBS itself has been identified. The UI asks users to verify the
source appears in OBS. Stable status messages are not reannounced every poll.

## Compatibility and scope

Project schema stays at version 1. No saved design fields, controller artwork,
button mapping, rendering algorithms or creative defaults were changed. Input-source
selection is explicit; Auto retains the existing first-standard-controller behavior.
Project data, colors, artwork, effects, textures, presets and layout are restored as
before. Controller-gallery/Tarantula work remains paused.

## Verification

setup-flow-test.cjs covers fresh/returning workspaces, automatic Live input, device
selection, disconnect and unsupported-mode feedback, no silent fallback, unchanged
project data, OBS instructions/URL/size/copy/client status, unavailable-service retry,
reset/Undo, saved configurations, hidden-tip preferences and responsive layouts.

setup-bridge-test.cjs exercises a real occupied local port with a mocked Electron
shell: it blocks false publication, preserves the prior overlay, retries after the
port is freed, serves and persists updated HTML, and tracks page connection/closure.
The existing local suites are retained; the smoke flow opens the consolidated
advanced test controls before using simulation modes.

Physical Windows native-dialog behavior and real G7/OBS capture still need hardware
validation. Existing storage limits and inherited artwork limitations remain.
