# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

🇪🇸 **[Leer en Español](CHANGELOG-ES.md)**

## [1.1.1] - 2026-03-02

### Fixed

- **Token Sizing Across Views**: Tokens now scale proportionally to the canvas container instead of using a fixed 96px size, ensuring consistent appearance between Editor, Player and Fullscreen modes.
- **Token Positioning Offset**: Drop offset is now calculated dynamically, preventing tokens from appearing shifted up-left in Player/Fullscreen vs. Editor.
- **Player Scroll**: Enabled scrolling in Player mode (non-fullscreen) so the map can be viewed when it exceeds the window size.
- **Scene Name Overlay**: Fixed the scene name appearing in the middle of the screen in Player mode; it now stays anchored to the bottom of the viewport.

## [1.1.0] - 2026-03-02

### Added

- **Default Assets**: Built-in sample maps and tokens loaded automatically on first launch.
- **Incremental Seed**: New default assets added to the manifest are loaded on next launch; deleted assets are re-created automatically.
- **Grid Size Slider & Input**: Adjustable grid size per scene (24–128px) via slider and keyboard-editable number input.
- **Scene Rename**: Rename scenes directly from the Timeline via a pencil icon on hover.
- **Scene Delete**: Delete scenes from the Timeline via a trash icon on hover.
- **Version Indicator**: App version displayed in the bottom-right corner of the Home screen.

### Changed

- **Larger Tokens**: Default token size increased from 64px to 96px for better visibility.
- **Percentage-based Positioning**: Token positions are now stored as percentages, ensuring consistency between Editor, Player and Fullscreen modes.
- **Fixed Aspect Ratio Canvas**: The canvas now uses a 16:9 aspect ratio for uniform token placement across views.
- **Token Z-index Management**: Clicking or dragging a token brings it to the front, making overlapping tokens easier to select.

### Fixed

- **Dark Background Filter**: Removed `opacity-60` and `blur` filters from the map background in the Editor.
- **Token Transparency**: Removed forced black background on tokens; PNG/WebP tokens with transparency now display correctly.
- **Token Sharpness**: Changed token rendering from `object-cover` to `object-contain` to prevent cropping.
- **Grid Keyboard Input**: Number input no longer jumps to max value while typing; clamping only applies on blur.

## [1.0.0] - 2026-03-02

### Added

- **Story Management**: Create, rename, delete, import and export stories as ZIP (with assets).
- **Scene Editor**: Visual canvas with drag-and-drop for maps, tokens and audio.
- **Player Mode**: Fullscreen presentation mode with scene navigation and ambient audio.
- **Asset Vault**: Upload and organize maps, tokens and audio tracks.
- **Configurable Grid**: Toggle grid overlay with custom color and size per scene.
- **Scene Audio**: Attach ambient music to each scene with auto-loop playback.
- **Local Persistence**: All data stored in IndexedDB via Dexie — no server required.
- **Import / Export**: Share stories between sessions as `.zip` files containing all assets.
- **Effects & Auras**: Immersive animations and visual feedback on tokens.
- **Cinematic Mode**: Automatic hiding of inactive UI in the player.
- **Lazy Loading**: Performance optimization by deferring vault bundle.
- **Quick Delete**: Tokens can be deleted in real-time during gameplay.
- **Integrated Dice**: Interactive floating panel to roll dice (d4 to d20).
- **Initiative Tracker**: Integrated turn tracking system for combat.
