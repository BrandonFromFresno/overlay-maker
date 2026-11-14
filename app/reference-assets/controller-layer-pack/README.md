# Controller Layer Pack

Extract the ZIP and open `index.html` in Chrome or Edge. Choose a skin and click **Run demo** to check the buttons, triggers, stick motion and stick clicks. For live input, stop the demo, focus the browser window and press a controller button. Live mode uses the browser's standard Gamepad API mapping. Model-specific Analog and Profile controls are included as artwork and in the demo.

For a transparent display, use `index.html?clean=1&skin=ps2-white`. Add `&demo=1` for an automatic demo. The local page can be pointed to from an OBS Browser Source via a file URL or served from localhost. Live input depends on the browser runtime exposing the controller, and was not verified in OBS.

Each skin's folder contains the original RGBA image and transparent cropped control layers. `manifest.json` records each crop's top-left offset, dimensions and stick pivot in original image pixels. For custom animation, draw the stick-well patch at that offset before drawing the displaced cap. Each well reconstructs the area hidden beneath the cap. The retaining ring remains in the original image. PS1 has no sticks. The Xbox Elite files retain the source labels Elite 1 and Elite 2.
