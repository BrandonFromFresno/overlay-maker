# Current candidate: 0.10.0 original VFX and button-material prerelease

Publication authorized after successful checks on November 9, 2026
(America/Los_Angeles). Original time-based effects, rebuilt button materials,
retired-effect compatibility, native-skin lighting, smoother holographic fallback
and renderer caches are documented in [VFX-QUALITY.md](VFX-QUALITY.md).

The Windows workflow must pass syntax checks and all 23 suites before packaging.
Publication matches the exact successful build SHA and validates archive contents
and checksum. Source controller artwork, geometry and input mappings are preserved.
Physical Windows controller and OBS/Streamlabs acceptance remain outstanding; this
is a prerelease. Earlier immutable customer URLs remain unchanged. Re-export an old
delivery to use the new rendering; the app requires this before reusing its handoff.

# Historical release: 0.9.0 production UI and GameSir skin gallery prerelease

Publication authorized November 9, 2026 (America/Los_Angeles). This release combines the 13 supplied G7 Pro 8K skins with the redesigned production workspace. See REVIEW-UI-0.9.0.md and REVIEW-START-SCREEN.md for scope and verification. Existing saved projects and the 0.8.2 stick-layering correction remain supported. Earlier releases remain available.

The Windows workflow runs syntax checks and all 22 suites before packaging. Publication uses the verified-artifact workflow, which matches the build to the exact source SHA and attaches an archive checksum. Actual Windows controller and OBS/Streamlabs acceptance checks remain required; this is a prerelease.

# Historical release: 0.8.2 stick-layering prerelease

Publication authorized November 9, 2026 (America/Los_Angeles). This hotfix keeps
the cap above the stationary rim during full travel and stick clicks. Both sticks
use the same corrected rendering pass. The 0.8.1 release remains available.
See REVIEW-STICK-LAYERING.md; the release checksum asset identifies the current
Windows ZIP. Earlier hashes below describe historical local candidate builds.

# Release readiness — 0.8.1 Windows prerelease

Reviewed November 8, 2026 (America/Los_Angeles). **Windows prerelease for producer acceptance testing. The user authorized publication on November 8, 2026 (America/Los_Angeles).** The separate customer farm was initialized with README, landing page and ignore rules. This record covers prerelease preparation; customer artwork has not been uploaded.

## Completed in the release pass

- Completed artwork switching: an imported logo can be reused after choosing text. Its button appears only when an image exists. Unused embedded logo/texture data no longer blocks project opening or text exports if that unused image is damaged. Image source data remains in saved projects.
- Made native project, HTML, PNG and OBS saves use a temporary file and rename. Simulated disk-full and rename failures preserve the prior file and active OBS design. Startup can recover from an unreadable previous OBS file and shows an actionable inline warning.
- Send new SSE clients the most recent input immediately, rejecting samples older than one second. Added response-close/error cleanup. No controller artwork, geometry or standard mapping changes were made in this pass.
- Replaced stale quick-start instructions and contradictory feature counts. The Windows ZIP now includes START-HERE.txt next to the executable.
- Added `npm run check` and `npm test`. Tests start their own server, use portable output paths, serialize native port users and bound browser concurrency to two workers. The Windows workflow runs these checks before packaging. The same checks run in the Windows packaging workflow.

The earlier held setup, editor, input and lifecycle work remains included; see REVIEW-SETUP.md, REVIEW-QOL.md, REVIEW-INPUTS.md and REVIEW-LIFECYCLE.md.

## Verified

- `npm run check`: all 43 JavaScript files passed syntax checking.
- **18 distinct suites passed** across the full regression run and focused reruns, covering first use, edits, undo/redo, autosave and legacy restoration, controller selection and interruptions, loading retry, all current input visualizations, fonts, anime presets, patterns/effects/textures, holographic fallback, PNG/HTML exports and local OBS bridge behavior.
- New browser checks passed for logo/text round trips, inactive damaged images, script-safe Unicode text, PNG dimensions and stored-overlay recovery feedback.
- New native checks passed for read/write/rename failures, temporary-file cleanup, saved/live consistency and immediate fresh SSE state. Native checks use a mocked Electron shell with real filesystem and loopback HTTP/SSE.
- Windows x64 ZIP packaging passed locally using electron-builder 26.18.0 and cached official Electron 39.8.10. ZIP integrity passed. The runtime, current quick-start, app archive and runtime notices are present; packaged application source matches the working candidate and all eight font licenses are included. This checks packaging, not executable launch.
- First-launch UI was visually inspected at 1440 × 1000; automated suites also cover responsive widths and keyboard/dialog interactions.

Local candidate: `release/Overlay-Studio-Windows-x64.zip`
Size: 137223423 bytes
SHA-256: `f995b787f0b26bd54754e5d4a7a2a631464ca2ac0753ea13b1f4bc45c524b21b`

## Internal production completion

The producer workflow now includes named reusable jobs and filenames, live-only
signal coverage, a separate self-contained customer runtime, versioned GitHub
uploads, private editable backups, protected credential storage, deployment
verification and stale-design/target-app handoff gates. New jobs default to an
included font; legacy system fonts are preserved but must be resolved before
customer export. Customers do not use the application or studio bridge.

The current farm is BrandonFromFresno/Controlverlay-Farm. Cloudflare Pages Free
with Git integration is the documented hosting route; GitHub Pages is neither
required nor enabled. No paid account, purchased domain or server-side function
is needed within free limits. See PRODUCTION-WORKFLOW.md for setup and capacity.

Production/browser and native farm checks passed using simulated input and fake
external API responses. One obsolete fixed-filename expectation was updated to
the new job-derived filename and its regression suite passed again. No real
Cloudflare account, GitHub credential upload or customer URL was exercised.

## Release blockers

The remaining gates are one-time hosting setup and Windows acceptance with the actual G7 and target streaming app:

0. Connect the farm to a free Cloudflare Pages account and the Windows app. Verify a real upload, automatic deployment, live-content check, credential storage and delivered URL. The repository is initialized, but the site/account connection remains outstanding.

1. Extract and launch the candidate offline on Windows x64. Verify native save/open dialogs, persisted settings after restart, overwrite/cancel behavior and installed-font discovery.
2. Verify physical G7 standard mapping: face buttons, D-pad diagonals, bumpers, trigger endpoints, stick travel/clicks, exposed utility/Home buttons, simultaneous input and disconnect/reconnect. Include focus loss and minimize/restore.
3. In OBS, verify transparent 1672 × 1241 capture, live response while the editor is in the background, design update/source refresh, source disconnect/reconnect and release of held inputs after app interruption. Browser tests do not measure device polling or hardware latency.

There are no remaining failing automated checks. Hosted delivery has a concrete external compatibility risk: OBS 33.0.1 has a reported Windows background-input regression (obsproject/obs-studio#14139), so direct customer input requires target-version acceptance and is not universally guaranteed. Windows/Electron integration, hardware input and OBS capture have not been asserted as verified. Publication was authorized for this prerelease; the physical acceptance gates remain outstanding.

## Documented limits and optional follow-up

Capture/M remain preview-only under the supported standard mapping; Home depends on host exposure. Explicit device selection may need reselection after a slot change. Unclean crashes can lose the latest debounce-window edits; the overlay retains a one-second stale-input fallback. These limits are documented in the quick-start and do not add speculative mappings.

Optional improvements: a clean replacement base to remove faint baked reference artwork, executable signing and an application icon/metadata pass. Additional gamepads and new creative features are outside this release scope.

## Repository-first continuation

Hosting is now optional when connecting the farm. Versioned files can be uploaded
and reopened with status stored and no customer URL. The UI displays the repository
path, disables deployment polling and customer handoff until hosting exists, and
clearly separates storage from a usable browser source. Adding hosting later
assigns pending URLs without another upload or token entry for the same repository.
Existing hosted URLs survive both removing hosting and an identical re-upload.
HTML content type is verified in addition to content bytes; raw text downloads are
not accepted as live overlay pages. Native farm and browser production/editor
checks passed. The Windows ZIP was rebuilt and its source/guide and ZIP integrity
verified. No customer artifact or application release was published in this pass.
The farm README was updated to match this repository-first workflow.

## Prerelease authorization

The user requested the latest ZIP and then explicitly authorized publishing the
most up-to-date version. Version 0.8.1 is being published as a prerelease in
BrandonFromFresno/overlay-maker, with a Windows ZIP and checksum. This is the
internal producer tool; customer overlays continue to use Controlverlay-Farm.
Historical held-work records describe the earlier publication hold, which this
instruction supersedes. Windows hardware/OBS/Streamlabs acceptance is still not
claimed as verified.
