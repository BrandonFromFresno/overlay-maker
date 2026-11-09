# Lifecycle hardening — unpublished 0.8.1 candidate

This pass keeps the current G7 artwork, input mapping, export format and saved-project schema. It adds no controller models or binding assumptions. Publication remains on hold.

## Implemented

- Added a visible initial loading state and an inline Retry loading action for renderer/font failures. Editing remains disabled until the renderer and restored images settle; invalid embedded user artwork leaves the design editable with a warning. Retrying preserves the open design and replaces failed font faces.
- Separated input sampling from renderer startup. Startup and pagehide send neutral input to the desktop bridge, and pagehide also neutralizes the live preview. Pageshow resumes sampling without adding duplicate frame loops.
- Catch Gamepad API access failures, show one actionable inline hint and keep sampling so access can recover without a reload. Unchanged controller/status text no longer rewrites the DOM every frame.
- Handle controller connection/disconnection events immediately. A disconnected device's lingering API snapshot is excluded until it disappears or reconnects. Live input cannot remain held because of that stale snapshot.
- Preserve the selected input-device slot and ID in a separate local preference. Explicit selection never falls through to another controller. Auto keeps the active compatible device when another device connects or the browser reorders its list; it chooses another compatible device when the active one is gone.
- Flush pending autosave and drag edits on pagehide as well as unload. Invalid saved data is left untouched during startup; unavailable local settings storage is clearly reported. Preview simulations remain temporary and startup returns to Live mode.
- Deduplicate unchanged status messages and repeat failures for the same embedded artwork. Connection feedback stays inline rather than producing notification prompts.

## Verification

`lifecycle-test.cjs` exercises missing controllers, quiet feedback, stable Auto behavior, explicit switching, stale disconnect snapshots, reconnect, Gamepad permission errors/recovery, pagehide/pageshow, single-loop resume, refresh restoration, persisted device choice, slot changes, loading/font retry, invalid artwork, corrupt saved data and unavailable storage. It uses simulated Gamepad API data and browser lifecycle events. Existing setup, input-visualization and editor suites cover surrounding behavior.

## Remaining limits

- A browser slot and Gamepad ID are not a hardware serial number. If an explicitly selected controller returns in a different slot, choose it again (or choose Auto); the app deliberately does not guess between controllers with identical IDs.
- Browser crashes or power loss cannot run pagehide/unload. The last edits inside the autosave debounce window may be lost. An OBS client retains the existing one-second stale-stream fallback for unclean interruptions.
- Windows hardware disconnect/reconnect, focus/minimize behavior, driver-specific modes and actual OBS timing still require physical-controller testing. Capture/M remain preview-only under the existing standard mapping.
