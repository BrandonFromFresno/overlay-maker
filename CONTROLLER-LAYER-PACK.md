# Additional layered controller templates

These options are added alongside all existing GameSir templates in **Templates → Visual model**. No existing family is replaced.

| Visual model | Included variants | Visible capabilities |
| --- | --- | --- |
| PlayStation original | Black, White | Face buttons, four D-pad directions, Select/Start, bumpers, triggers; no invented sticks or Home |
| PlayStation 2 | Black, White | Two sticks/clicks, face buttons, D-pad, Select/Start, bumpers/triggers; Analog is preview-only |
| PlayStation 3 | Black, White | Two sticks/clicks, face buttons, D-pad, Select/Start, PS/Home, bumpers/triggers |
| Xbox 360 | Black, White | Two sticks/clicks, face buttons, D-pad, View/Menu, Xbox/Home, bumpers/triggers |
| Xbox Elite artwork | Elite 1 and Elite 2 source designs | Standard visible inputs; Profile is preview-only |

Elite variant names retain the supplied pack's identifiers and do not certify a particular hardware revision. Any browser-standard compatible gamepad can drive these visual layouts. Physical bottom/right/left/top face inputs map to their corresponding visual positions; selection does not remap the hardware.

## Source and integration

`Controller-Layer-Pack.zip` is preserved under `app/reference-assets/controller-layer-pack/` in its original folder structure. Only the JSON placement data and PNG images are used by the studio. The supplied HTML/JS demo is reference content and is not executed or included in customer exports.

Original covers are embedded byte-for-byte. Control alpha masks supply highlight and picking paths. Individual cap and reconstructed socket PNGs load with the selected model. The painter uses the supplied cap pivots and 8/9-pixel source travel (uniformly scaled with the artwork); socket patches and surrounding rims remain stationary. There is no additional dead zone, easing, hardware listener or input delay. D-pad disks use four nonoverlapping directional sectors; diagonals activate both corresponding sectors.

White preserves the original shell, caps and colors. Colored shell selections retain shading and can visibly recolor the dark variants, separately from the physical controls. Per-button tints retain relief and original colored symbols. The standard neon effect has an inner shell edge on these models, including the stickless PS1 layout. Existing materials, holographic/abstract finishes, artwork, fonts, press effects, comic bursts, presets and stick presentation continue through the shared renderer. Stick settings are disabled on the PS1 artwork, while physical axes remain available to the verification workflow.

The saved-project schema remains version 1. New model IDs require this build or later; previous releases cannot open a job using an unknown model. Existing saved jobs and templates remain valid. Customer HTML embeds only its chosen skin and cap/socket images, alongside the shared renderer; it requires no editor, source ZIP, vendor software or external asset server. Renderer revision 7 identifies this implementation; older published customer URLs remain immutable.

The original pack includes no explicit redistribution license. It is separate from the Xelu CC0 collection; those license terms are not applied to this artwork. Provenance is recorded in `docs/controller-layer-pack-audit.json`. Source possession and simulated input checks do not certify hardware or redistribution rights.

## Rebuilding and verification

Run `python tools/import-controller-layer-pack.py` with Pillow and NumPy installed. It reads the local source pack and rebuilds five model packages and ten thumbnails. `tools/raster_paths.py` provides the shared alpha-boundary tracer.

`node tools/test.cjs layer-pack-test.cjs models-test.cjs` exercises exact embedded source bytes, every exposed control, compound/diagonal inputs, analog trigger depths, 16 stick directions, original travel, fixed rims, independent colors, materials, artwork, presets, gallery selection, preview-only controls, saved restoration, reset/Undo and standalone offline customer output. Package verification includes all new model scripts and thumbnails. Actual controllers/firmware, Windows packaging and target OBS/Streamlabs behavior still require their respective acceptance checks.

[Rendered skin overview](docs/controller-layer-pack-preview.png).

## Completed verification

All 32 regression suites and 120 JavaScript syntax checks passed. The packaged ASAR verifier confirmed all 31 model data packages, thumbnails and required source files. All 184 files in the supplied ZIP remain byte-for-byte unchanged; SHA-256 `05ea3f30c384f31b24d98db1e2473ade8b80d1aeed72a536b4ff937f849885d3`. Original GameSir model definitions compare exactly to the previous catalog; Xelu templates are removed in version 0.16.1. Neutral and pressed/customized renderings were visually reviewed. Included in the 0.16.0 release candidate; physical-controller and OBS/Streamlabs acceptance remain manual.
