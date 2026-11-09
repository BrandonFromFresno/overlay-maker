# Input visualization review — unpublished 0.8.1 candidate

The supplied G7 artwork, face paths, controller placement, standard button mapping and saved-project schema remain in place. This pass builds on the pending setup/editor changes; it does not publish a release.

## Changes

- Isolated the moving stick caps from the socket/rim pixels included in their source crops. Fixed sockets remain part of the stationary base; caps and click coloring stay inside the original openings. Both sticks retain the existing 38 px maximum travel.
- Constrained diagonal displacement to the same circular travel as cardinal directions. No dead zone, button easing or additional frame buffering was added. Four finite axes and bounded trigger values are shared across live input, manual previews and standalone exports.
- Stick clicks tint the actual textured caps instead of adding a floating translucent disk. Labels use contrasting ink for light and dark colors. Removed an extra bumper outline that painted a few transparent edge pixels. Face-button and utility highlights retain their SVG clipping; Home retains its protected chrome rim.
- Trigger tint now interpolates from the selected resting color to its pressed color throughout depth. Removed the first-pressure color jump and confined trigger lettering to its source silhouette. Invalid/out-of-range input cannot escape travel/depth limits.
- Changed inputs forward to the local OBS bridge on the next sampled display frame, replacing the extra 30 ms gate. Unchanged states use a 250 ms heartbeat. Physical input continues forwarding independently of editor preview modes.
- Exported overlays clear state immediately when EventSource reports an error; the existing one-second stale-stream timeout remains a fallback. Disconnected gamepad objects explicitly produce neutral input.

## Verification

`input-visualization-test.cjs` exercises all 17 drawable digital controls, four D-pad diagonals, both stick clicks during 16-angle full-travel sweeps, fixed rims, circular bounds, trigger depth, simultaneous inputs and exact neutral restoration. It checks standard mapping and consecutive-frame forwarding using a simulated Gamepad API, and executes generated standalone HTML with simulated SSE input and connection loss. Existing color/shoulder, anime, setup, editor and native bridge suites cover surrounding behavior.

## Physical checks still required

- G7 hardware in Windows/Electron: driver mapping, analog trigger endpoints, stick calibration/drift, rapid taps, simultaneous presses and unplug/reconnect.
- Whether Home is exposed by the OS while Xbox Game Bar or other interceptors are active. Capture/M remain manual preview controls: the existing standard Gamepad API mapping does not expose them separately. No vendor-specific or guessed bindings were added.
- OBS browser source with the Windows app in the background/minimized: real input-to-display latency, long-running connection/recovery and frame pacing. Browser tests do not verify 8 kHz device polling or measured hardware latency.
