# Visual controller models and universal input

The appearance and the physical input device are independent. A browser-standard Xbox, PlayStation or other gamepad can drive any selected visual layout. Canonical face inputs mean bottom, right, left and top positions. Printed letters on Nintendo-style artwork do not redefine these positions. Existing G7 projects retain their previous bindings.

## Production workflow

Choose **Templates → Visual model**, then a skin. Previewing keeps the current job unchanged until **Use…**. **Keep current customization** carries colors, logo/text, effects and placement into the new layout. Continue returns to the current job. **Use default overlay** restores the selected model’s default appearance; Undo restores customization. Saved version-1 projects retain their format; jobs without a visual-model field reopen as the established G7 model.

Models load on demand. Only the chosen variant is embedded in customer HTML. Customer output has no dependency on the editor, original GameSir installation, external controller packages or native vendor runtime. The existing studio bridge and browser-standard customer runtime remain in place.

## Included visual inventory

22 visual families, 60 variants: the established 13 G7 Pro 8K skins plus 47 additional supplied variants. Source identifiers are retained where an official marketing name cannot be verified. These are visual templates, not claims that the matching hardware was physically tested.

| Source model ID | Variants | Available artwork |
| --- | ---: | --- |
| G7ProCE | 13 | Gold, Aimlabs, GoldenApple, Crown, White, Black, Blue, GradientBlue, G7Pro, XReal, NBA2K, Nioh, YingRen |
| C2 | 1 | White |
| C3 | 1 | White |
| G7 | 1 | Black |
| G7Mini | 2 | Pink, Purple |
| G7Pro | 12 | Aimlabs, Amazon, Black, Blue, GradientGray, GradientPink, GradientSilver, Orange, Purple, RuLong, Silver, White |
| G7SE | 2 | Black, White |
| G7SEPlus | 1 | White |
| K1 | 2 | Black, Gold |
| K2X | 1 | Black |
| K2_8K | 1 | Black |
| N2S | 4 | Black, Nioh, Pink, White |
| T3CE | 2 | Default, MenaRD |
| T3Lite | 1 | White |
| T3Pro | 1 | Black |
| T3ProXBox | 1 | White |
| T3XS | 3 | Gray, MenaRD, White |
| T4N2 | 1 | White |
| T4NPro | 4 | Black, HatsuneMiku, White, YYS |
| T7 | 2 | Sliver, White |
| T7Pro | 2 | RetroGreen, Sugar |
| T7ProW | 2 | Black, RetroGreen |

## Reference audit and missing dependencies

Source archive: `GameSir_Development_Files.zip`, SHA-256 `cc9c3756f6b466378fa5bdddcd2cdb767030689cd6c86a9065bc5935f0669cd3`. The read-only audit found 106 files, 100 SVGs, 22 asset folders and two compiled application bundles. Detailed static inventory: [gamesir-resource-audit.json](docs/gamesir-resource-audit.json). Re-audit an archive without executing it using `python tools/audit-gamesir-resources.py --help`.

The supplied index selects `app.7ab89ecc.js` with 21 registered components. The alternate bundle additionally supplies C3. G7 artwork also exists; its supplied FullCover is byte-identical to G7SE/Black, allowing that measured adapter. G7ProS has registrations but no supplied artwork and is excluded. Configuration-only variants with missing images are excluded. Three previously included G7 Pro CE skins absent from this archive remain unchanged. No inferred “Tarantula” marketing name is assigned to an internal identifier.

The reference frontend is Vue 2.6.14 with SVG components in a 1000 × 720 coordinate space. Native host events supply semantic button state, trigger bytes (0–255), normalized stick axes, mapping and device identity. The supplied frontend itself does not read navigator.getGamepads. Its native host/backend, HID and VID/PID profiles, mapping tables, source maps and referenced GameSir font are missing. Artwork presence therefore does not establish hardware compatibility.

Isolated reference probes exercised 588 synthetic boolean press/release cases across 21 active adapters, analog trigger depths and stick states; 342 boolean cases changed the DOM and all 588 returned to the original DOM. 46 of 68 active registry/variant candidates loaded every expected image; 22 had missing images. C3 was separately mounted from the alternate bundle. These were reference event simulations, not physical-device certification.

## Integration approach

Only supplied graphics and measured component geometry are adapted; vendor executable/runtime, updater, native window management and consumer settings are not shipped. Source geometry supplies button boundaries, transforms, fill rules, physical stick locations and optional LCD controls. Generated packages retain source folder/hash and any Cover-for-FullCover substitution. Artwork is rasterized transparently at four times the reference resolution, then uniformly fitted to the existing output canvas. Detached trigger displays occupy the established HUD row; physical housing components preserve their common transform.

Stick caps are isolated from the fixed housing/rims. Source SVG circular plates determine their geometry where available; raster edge measurements cover the remaining variants. LCD artwork is protected from shell customization. T7/Sliver reuses aligned shoulder geometry from T7/White within the same source family. Existing G7 rendering follows its original code path.

## Limits and release checks

The browser must expose a standard mapping. Raw HID/nonstandard mappings need a validated adapter; universal visual selection does not manufacture missing hardware signals. Optional L4/R4/L5/R5, C1–C4 and T1–T3 artwork can be simulated where supplied. They are not advertised as independently live unless an actual distinct input is available. Models without Home artwork do not receive a fabricated Home button.

Automated model checks exercise every included geometry control, compound inputs, diagonal D-pad, trigger depth, stick travel/clicks and exact release to neutral. They also cover brand-independent standard input, isolated gallery selection, restoration/reset/Undo and self-contained customer output. Physical controllers, vendor firmware/modes, actual OBS/Streamlabs focus and target-machine performance still require hardware validation. Test the customer’s actual controller and final source before delivery.

## Asset rights

The archive contains no GameSir artwork redistribution license or EULA. The Vue MIT notice applies to Vue, not controller artwork, logos or licensed character graphics. File possession does not establish commercial redistribution rights. Source provenance is retained; commercial artwork/customer redistribution rights remain unverified and must be established with the respective rights holders. The original GameSir installation is never modified.
