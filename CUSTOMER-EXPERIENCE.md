# Customer setup and review workflow

The production editor stays internal. A customer receives a finished hosted overlay, not an editor, configuration file, installer or asset bundle.

## One exported page, two views

The clean delivery URL renders only the transparent controller at 1672 × 1241. Adding `?setup=1` (or `&setup=1` when a query already exists) opens the optional customer setup view from the same HTML file. It provides a live preview, activation help, connection/reconnection feedback, the exact dimensions and a Copy OBS URL button. That button removes only the setup parameter, so the customer pastes the clean source into OBS or Streamlabs. Instructions and the checkerboard never appear in the normal overlay view.

The setup page embeds its own styles and uses the same embedded graphics, fonts and direct Gamepad API runtime as the finished overlay. It loads no editor, native bridge, account, analytics, external assets or additional setup files. Missing input, unsupported mode, blocked/unavailable browser access and artwork failure each have specific feedback. Disconnects clear the visual inputs. Failed or unfinished artwork cannot report a premature live state.

The generated customer handoff includes the optional setup-guide link and the clean OBS URL. Existing immutable deliveries retain their previous content; re-export a job to supply this new setup experience. Saved project format and artwork remain compatible.

## Demonstrate the customer's experience

In the Windows editor, choose **Export & OBS → Preview customer experience**. This opens a separate sandboxed review window with direct gamepad input and no editor preload, Node access or credentials. It requires no GitHub connection or upload. The local preview is clearly identified and its Copy OBS URL button is disabled, preventing an accidental customer handoff of an expiring studio URL.

Review pages use random loopback paths in memory. Replacing or closing a review expires its route. They do not replace the studio OBS overlay, change the design, upload a customer page or create delivery records. The normal customer delivery remains a public HTTPS page with no running-editor dependency.

**Set up uploads / Manage uploads** exposes the existing repository configuration. Connection availability is visible outside the expandable technical settings, explaining disabled upload controls. Font problems lead back to the included font picker.

## App navigation for a first-time reviewer

**Find a tool**, Ctrl+K / Command+K, or F1 opens searchable task navigation. It supports multiword searches such as “change button colors” and “upload logo,” keyboard result navigation, empty states, focus restoration and a short walkthrough. It routes to the existing controls rather than duplicating settings.

When a template preview is selected, design actions explicitly say they will use that preview before opening the tool. Apply uses the existing checkpoint/Undo path; file-open and demo commands do not apply previews. Live input verification opens without automatically starting or certifying the check. Focused results remain stable during connection/status refreshes.

**Try input demo** is directly available on the gallery and beside Live controller. It changes temporary preview input only. It never modifies saved artwork or substitutes for physical input observations or customer input.

## Verification and limits

Automated checks cover customer-page isolation, clean transparency, query handling, clipboard failure recovery, safe customer names, activation, connection/disconnection/reconnection, blocked/unsupported input, artwork loading/error states, lifecycle resume and responsive layouts. Navigation checks cover keyboard search, real control routing, focus stability, demo isolation and delivery setup. Native tests cover sandbox settings, loopback routes, navigation restrictions and cleanup. Existing rendering/model, saved-project, export and bridge suites remain part of the release gate.

Physical controllers/firmware and the exact target OBS/Streamlabs version still require acceptance testing, especially input while a game has focus. The setup guide explains that browser-preview success does not certify OBS behavior. Vendor-only inputs remain preview-only in this version. No checkout, payment, order-fulfillment automation or new gamepad support is introduced in this update.

Screenshots: [customer setup](docs/customer-setup-0.13.png), [task finder](docs/navigation-0.13.png), [compact gallery](docs/customer-gallery-0.13.png).
