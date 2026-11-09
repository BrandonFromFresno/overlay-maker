# Stick cap layering correction

The reported left-stick imperfection was reproduced at full travel. A fixed
105 px socket clip truncated the moving 86 px cap after its 38 px displacement,
making it appear to pass underneath the surrounding rim.

Removed that socket clip from the shared stick pass. The base still draws the
stationary socket/rim; the isolated cap draws above it. Cap artwork, size,
centers, travel, button mapping and pressed-label clipping are unchanged. The
same correction applies to both sticks, since they shared the defective path.
The maximum cap envelope remains within the existing 125 px control region.

A new regression check failed against the released renderer, detecting 58,288
mismatching cap-perimeter samples, then passed with the correction. It checks
both sticks across 16 directions, neutral/pressed colors, uncovered rim pixels
and exact neutral restoration. The broader input-visualization suite also passed,
including simultaneous inputs, triggers, mapping and standalone HTML behavior.
Its fixed-rim assertion now distinguishes legitimate cap occlusion from rim
movement. Before/after crops were inspected from the actual renderer.

The user authorized publishing this correction as prerelease 0.8.2 on November 9,
2026 (America/Los_Angeles). The 0.8.1 ZIP remains intact. The release pipeline
requires a passing Windows build for the exact source commit before publishing.
Physical-controller/OBS visual acceptance still requires the new test build.
