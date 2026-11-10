# GameSir G7 Pro 8K skin assets

Imported from the two GameSir web archives supplied by the project owner on 2026-11-09:

- GameSir-Web-20261109-142745-Part1.zip
- GameSir-Web-20261109-142745-Part2.zip

`gamesir-skins.js` contains the 13 `static/devices/G7ProCE/*/Cover.svg` skins where available, with the supplied PNG fallback for the remaining skins and their supplied `FullCover.png` gallery images. Each record preserves its original cover SHA-256, filename, dimensions and folder name. These are the G7 Pro CE/8K family shown in the supplied GameSir Overlay video; the other device families in the archives have not been added to the app.

Control outlines were extracted from the isolated SVG render functions in `js/app.7ab89ecc.js`; placement and color data come from its G7ProCE theme configuration. The original application, Vue runtime, device services and remote endpoints are not executed or distributed. Rebuild with `node tools/import-gamesir-skins.cjs /path/to/merged/web/folder`.

The editor fits each cover uniformly into the existing body layer. Stick caps are isolated from the cover; sockets and rims remain stationary. Standard Gamepad API input mapping and output dimensions remain unchanged. Existing projects without `nativeSkin` retain their legacy Studio artwork. Project files store a validated skin ID; standalone customer HTML embeds the selected skin and shared renderer.

The source art and branding remain GameSir's. These files are user-supplied reference assets, not original Studio artwork or an endorsement by GameSir.
