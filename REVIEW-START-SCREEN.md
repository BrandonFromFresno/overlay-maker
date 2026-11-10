# GameSir opening skin gallery

The opening screen now uses the 13 original G7 Pro CE / G7 Pro 8K skins supplied in the two GameSir web archives: Champion Gold, Aimlabs, Golden Apple, Crown, White, Black, Blue, Gradient Blue, Classic, XREAL, NBA 2K, Nioh and Yingren. The former temporary Studio color bases have been replaced. Other controller families in the archives are not exposed or bundled.

The gallery shows a large live preview, original cover thumbnails, connection feedback and an explicit action to enter the editor. The Templates header control returns to it. Covers use the supplied SVG wherever available and PNG otherwise, fitted uniformly without stretching. Original source filenames and SHA-256 values are recorded in the generated library; see app/gamesir-assets-source.md.

Previewing another skin does not change the current job, autosave or Undo history. Applying one creates an Undo step. Restored jobs appear first and can be resumed directly; project imports use the existing validation/loading flow. Old projects without a skin ID keep their established Studio artwork. Resetting a stock-skin job restores that skin, with Undo available.

Native control outlines and positions come from the supplied GameSir SVG render data and theme configuration. Button highlights preserve the edition's printed emblems, remain inside the cover alpha and release to neutral. Stick caps move separately above fixed sockets and rims. Shell tint, patterns, textures, effects and theme artwork use masks for the selected skin. Gamepad API mapping and overlay dimensions remain unchanged.

Saved projects retain a validated skin ID. Customer and studio HTML embed only the selected skin, omit gallery thumbnails and keep the existing self-contained renderer. Customer output has no dependency on the editor or GameSir app. The export remains subject to the established 30 MB limit.

Run `npm run check` and the browser suites via `npm test`. The launch suite covers selection/apply/Undo, saved-job recovery, responsive layouts and imports. The native-skin suite covers all 13 skins, 247 input/release checks, 16 stick directions per skin, contained highlights, surface customization/reset, legacy round trips, saved restoration and standalone customer export. Existing input, lifecycle, setup and production suites protect the prior workflow.

Verified on 2026-11-09: 17 browser suites passed across the focused and regression runs, including the native-skin and launch suites; syntax checks passed for 50 JavaScript files. Physical Windows controller and OBS/Streamlabs checks remain necessary before a release claim. The user authorized publication with the 0.9.0 UI release on November 9, 2026 (America/Los_Angeles).
