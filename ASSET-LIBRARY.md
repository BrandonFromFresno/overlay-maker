# Reference asset archive

Xelu overlays have been removed from the template gallery and application packages. Their generated model scripts, thumbnails and importer are removed. The original uploaded Xelu files remain byte-for-byte unchanged under `reference-assets/xelu/`, outside the shipped app and review site. They are reference files only.

The [Controller Layer Pack](CONTROLLER-LAYER-PACK.md) and all original GameSir templates remain available: 27 visual families / 70 skins.

Existing standalone customer HTML contains its own artwork and is unchanged. Xelu project files are explicitly rejected in the current editor rather than being silently converted. A previous Xelu autosave is backed up separately, with a download action; version 0.16.0 can still open those files. If that backup cannot be stored, automatic saving pauses until the original project is downloaded.
