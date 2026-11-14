# Xelu asset library and starting templates

The supplied archive is preserved under `app/reference-assets/xelu/`, with every original folder, filename and file byte intact. The readme, editable source and nested export ZIP stay in their original locations. No archive instructions or source files are executed.

[View the rendered template overview](docs/xelu-templates.png).

Five independent visual models are available in **Templates → Visual model**: **DualSense, DualShock 4, Xbox Series, Xbox One and Amazon Luna**, each labeled **Xelu outline**. Each offers **Labeled outline** and **Clean outline** skins. They use only that controller's own diagram from its original folder, with a neutral backing and dark outlines so the shell can be customized. They do not replace or blend into existing GameSir templates. Keyboard, mouse, VR, gestures and small controller prompts remain reference assets, not selectable full gamepads.

Saved jobs using these new model IDs require this build or later; previous app versions cannot recognize them. Existing saved GameSir jobs remain compatible.

The new models use the existing standard-gamepad input, geometry painter, button colors, artwork, shell materials, effects, anime presets, saved projects, reset/Undo and customer HTML export. Selecting a visual template never changes physical input assignments. Face buttons follow physical bottom/right/left/top positions, including PlayStation symbols.

Input boundaries follow enclosed regions in each diagram. Stick caps move independently while surrounding socket artwork stays fixed. Triggers remain at their depicted physical positions and show analog depth through color. The clean drawings omit Home artwork; their templates therefore omit a fabricated Home target. The Xbox Series labeled capture symbol is available for preview like existing vendor controls, but the standard input reader does not provide a separate capture signal. PlayStation touchpads accept shell artwork and finishes but do not register touch gestures. Luna microphone controls remain decorative: this work does not add proprietary touch, microphone or HID support.

The original readme declares the artwork CC0 (Nicolae “Xelu” Berbece / Those Awesome Guys). Generated source hashes are in `docs/xelu-template-provenance.json`. Rebuild with `python tools/import-xelu-templates.py` (Pillow, NumPy, SciPy). Only generated packs and thumbnails are read by the editor; original sources are never loaded by the renderer or embedded wholesale in customer output.

Run `node tools/test.cjs xelu-templates-test.cjs models-test.cjs start-screen-test.cjs` to verify the new visual templates, all model input paths, gallery behavior, customization, exports, restoration and reset. Physical controller firmware/modes and actual OBS/Streamlabs acceptance still require hardware testing.

## Verification

Completed: 113 JavaScript syntax checks, all 31 regression suites, source/asset ASAR verification for all 26 data packs and thumbnails, byte-for-byte verification of all 646 original archive files, and visual review of the five rendered layouts. Existing 22 model definitions compare exactly with the previous catalog. Publication and physical-controller/OBS acceptance are not included.

A separate [Controller Layer Pack](CONTROLLER-LAYER-PACK.md) now adds another five families / ten skins. Its source files, provenance and rights information remain separate from Xelu.
