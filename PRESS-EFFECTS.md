# Button press and analog effects

Open **Effects → Button press & analog effects**, or use **Buttons → Customize press effects**. Find a tool also accepts searches such as “press effects,” “trigger effects” and “pressure.”

## Press bursts

Enable **button press effect**, then choose:

| Style | Response |
| --- | --- |
| Energy rings | Expanding rings and short radial trails; the existing effect remains the default. |
| Impact sparks | Seeded streaks with varied travel, soft tips and a curved falloff. |
| Soft shockwave | An expanding luminous band with a softer secondary wave. |
| Orbital halo | A brief soft wash and three fading orbital arcs. |

Bursts start on a new press, expire after the chosen duration and do not repeat while held. Rapid presses retain up to three overlapping bursts per input, so starting a new burst does not abruptly remove the previous one. Trigger activation uses hysteresis to avoid repeated bursts from small fluctuations near the activation threshold. Stick clicks use the selected template’s actual socket positions. Effects are clipped to the shell, leaving button faces, stationary rims and transparent areas clear.

## Analog responses

Choose **Pressure glow**, **Pressure ripples**, **Electric charge** or **Particle jet**, then select **Trigger depth**, **Stick movement**, or **Triggers + sticks**. The current input amount controls brightness and spread; particle jets begin outside the control boundary and flow toward the housing interior so small stick movements remain visible.

These controls use trigger travel or stick deflection, not a physical force sensor. Standard face buttons, bumpers, D-pad directions and stick clicks provide on/off input. Digital trigger modes also produce on/off values. Zero analog input immediately removes continuous feedback. Press bursts may finish their short dissipation after release.

## Customize and preview

Use the accent color, each input’s existing pressed color, or a custom color. Choosing individual pressed colors exposes a shortcut to the existing button-color panel. Strength and size apply to both response types; burst duration controls press bursts only. Size changes the effect spread while keeping its origin outside the physical control boundary.

**Try effect demo** cycles triggers and both sticks without a controller. Its simulated input never counts as physical verification and is not forwarded to OBS. Full and Reduced motion support the effects; Still suppresses them while normal live input highlights keep working. Reset affects this group only, and Undo restores it.

Settings are included in editable projects, autosave, studio OBS/HTML and finished customer HTML. The customer installs no effect assets or software. Old version-1 projects migrate to the existing rings, 700 ms duration, accent color and no additional continuous response. Existing immutable customer URLs keep their original runtime; re-export a job to deliver the new effects.

## Verification

The effect suite covers all eight treatments, analog depth and low stick travel, trigger/stick/both source selection, duration/size/color changes, press expiry/rearm, analog jitter, backward clocks, 30/60 Hz history independence, neutral/Still behavior, shell alpha/control protection and a symmetric model’s stick-click anchoring. It also covers validation/migration, editor controls, demo, restoration/reset/Undo, responsive layouts and live feedback in a self-contained customer export.

Physical hardware, firmware modes and the target OBS/Streamlabs version still require acceptance testing. Styling does not add new vendor-only button mappings or physical pressure sensing.

[Controls](docs/press-effects-panel-0.14.png) · [Eight effect treatments](docs/press-effects-review-0.14.jpg)
