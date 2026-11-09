# Internal production and customer delivery

Overlay Studio is the business's internal Windows production tool. Customers receive a finished browser-source URL, not this application, project sources, an asset folder or a local input bridge.

## Repository first; hosting later

Delivery repository: https://github.com/BrandonFromFresno/Controlverlay-Farm

The repository has been initialized with hosting instructions, a landing page and ignore rules. No customer artwork, editable projects, credentials or application release was uploaded during this pass.

Use Cloudflare Pages Free with this GitHub repository. GitHub stores finished files; Cloudflare serves them as HTML over HTTPS. GitHub Pages is not required or enabled. GitHub's business-hosting restrictions make it a poor default for paid customer delivery.

For now, connect the repository in the Windows app with a fine-grained GitHub token scoped to `Controlverlay-Farm`, Contents read/write only. Leave Free hosting URL empty. The token is protected by Windows, stays outside exports, and must never be pasted into chat.

Upload customer overlay then stores the finished file and a private editable backup. The app displays its repository path and **Saved in the repository**. It does not generate a fake OBS URL, run hosting polls or enable customer handoff.

When you want hosted delivery:

1. Create/sign in to a free Cloudflare account and connect this repository to a Pages project using Git integration.
2. Choose production branch `main`, framework `None`, no build command and build output directory `/`.
3. In the app's existing GitHub connection, add the assigned HTTPS `*.pages.dev` URL and save. Leave the token empty to reuse the protected connection for this same repository.
4. Previously stored overlays acquire their hosting URLs without another upload. Existing customer URLs remain unchanged. The app verifies HTML content type and exact exported bytes before marking a URL live.

Cloudflare authorization happens in its own dashboard once; no Cloudflare API token is needed in the app. Git pushes made by customer uploads then trigger automatic site deployments. Deployment is not instantaneous: the app polls the final URL and verifies its exact content before calling it live.

## Everyday job

1. Name the customer/job. Open a reusable `.overlay` configuration or an earlier delivery's local editable backup, then customize the current G7 design. The existing precise position controls, drag, keyboard nudges and Undo remain available.
2. Run Verify customer inputs → Start live input check. Use the physical controller. The tracker observes button press/release, trigger partial/full depth and neutral, full cardinal/diagonal stick travel and return to neutral, plus four D-pad diagonals. Demo/manual input never counts. Home is an optional observation because host exposure varies; Capture/M remain preview-only.
3. Use included fonts for text intended for delivery. New jobs default to an included font; older projects retain their typeface. Customer export blocks active system-font text until an included family is selected, preventing a hidden font-install requirement for customers.
4. Choose Upload customer overlay. The app saves a private editable backup first, uploads one finished self-contained HTML page, and keeps earlier URLs intact. Identical exports reuse the same path instead of overwriting customer files.
5. While hosting is deferred, keep the overlay stored in the repository. Once hosting is configured, wait for URL live. Test that exact URL in the target OBS/Streamlabs version while a game has focus, including simultaneous inputs, releases and reconnect. Confirm the target-app check in the app, then Copy customer handoff.

A URL can be uploaded before checks finish so the producer can test the real hosted page. The handoff control remains unavailable until the physical signal observations, live-content check and manual target-app confirmation are complete. These gates prevent an upload success from being presented as tested delivery.

Changing the design invalidates handoff readiness. Switching the physical test device invalidates its observations. Reopening a delivery restores source and URL without changing the customer's existing page. Native backups live under the app's user-data `delivery-backups` directory; they are not stored in the public farm.

## Customer experience

The copied message supplies the finished URL, Browser Source dimensions 1672 × 1241, and a brief connection/Interact instruction if the host needs activation. It applies to OBS Studio and Streamlabs Desktop. Customers do not install the producer tool, download assets, edit code, choose skins or install fonts.

The customer page reads the standard Gamepad API on the customer's machine. It contains the selected font and all artwork; it does not open EventSource, contact port 18777, or call Electron. The studio's loopback URL and studio-test HTML remain available separately for internal testing.

## Verified and outstanding

Production browser tests cover job-name persistence/filenames, physical-only observations, design invalidation, handoff gates, backup restoration and a customer page running without the studio bridge. Native delivery tests use mocked GitHub/hosting responses to check encrypted storage, idempotent versioned uploads, exact live-content validation, no credential forwarding to public hosting, permission failures and restoration.

Actual Cloudflare account connection, GitHub authentication/upload/deployment, Windows protected storage and physical-controller behavior in OBS/Streamlabs still need live acceptance testing. The repository is initialized, but no Cloudflare account/site or live customer URL has been provisioned from this session.

In particular, OBS has a documented Windows background-input regression in version 33.0.1. Hosting cannot fix a browser host that does not supply background controller input. Test the actual supported host/version; do not promise universal compatibility from simulated browser tests.

## Capacity

The basic customer HTML measured about 5.8 MB, with roughly 5.2 MB of shared embedded controller assets. Custom logos and textures add to that. These are uncompressed file totals; Git compression and history affect repository size differently.

Cloudflare Pages Free currently documents 500 builds/month, 20,000 files/site and 25 MiB/file. The uploader enforces the file limit. Every retained version counts as a file. GitHub recommends keeping repositories ideally below 1 GB and strongly below 5 GB; these are recommendations, not automatic overlay-count cutoffs. Review growth around 100–200 self-contained versions as a conservative optimization checkpoint. Sharing common assets is an optional future improvement; no customer asset assembly would be necessary.

References:

- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- https://github.com/obsproject/obs-studio/issues/14139
