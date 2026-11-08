# Textures and tttexture reference

## What the supplied link provides

[fffuel tttexture](https://www.fffuel.co/tttexture/) is a collection of 360
photographic JPEGs of aged walls, concrete and other worn surfaces. Its page
builds the numbered collection from 001–360. It is an image collection, not an
embeddable texture generator. Many images contain light marks on black. A tested
full-resolution sample is 7360×4912 pixels (about 36 megapixels).

[The linked license](https://www.fffuel.co/license/) permits personal and commercial
use and says: “You cannot sublicense, resell, share, transfer, or otherwise
redistribute the Images.” Read on 2026-11-08. No fffuel photograph or thumbnail is
included in this public source, application ZIP, or built-in finish library.

## Use actual tttexture images

1. Open **Textures → Browse fffuel tttexture** to open the collection in your browser.
2. Download the JPGs you want, then use **Import JPG / PNG textures** in the app.
3. Select one from your local library and adjust strength, blend, scale and rotation.

Import up to 20 images at a time (25MB and 64 megapixels per image). Copies are
resized to a maximum 1600px edge. PNG transparency is preserved; JPEG copies use
quality .88. Optimized source data is limited to 4MB per image. Original files are
unchanged. Storage errors keep the first imported image usable in the open
project and prompt saving the project file. The library uses IndexedDB and stays
on this computer. Lazy image previews limit decoding when the library grows.

Imports use Screen on a dark shell, or inverted Multiply on a light shell. This
makes the collection's white scuffs work on either palette. Both can be changed.
Monochrome preserves the color palette; disable it for a texture's own color.
Removing an entry from the library never removes it from an open or saved design.

## Included offline finishes

Eight independently generated finishes are included: Fine grain, Concrete, Aged
plaster, Worn paper, Scuffed paint, Ink speckle, Brushed metal and Woven canvas.
These are original procedural patterns, not copies of the photographic collection.
Seeds give repeatable surface variations. The same seed and settings export the
same finish. Texture is applied only to the shell, below patterns, theme engraving
and artwork. Controls, stick caps, bumpers, triggers and transparency are protected.

Projects embed the selected imported texture and all its settings; their appearance
does not depend on the library entry. HTML/OBS export embeds the texture painter
and selected image and needs no fffuel/network access. PNG captures the composited
still. No-texture is the default for older projects. Presets and Restore theme look
preserve the texture. Undo restores texture changes.

[See the texture tab](docs/texture-editor-preview.png).
