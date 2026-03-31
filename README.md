<div align="center">

# 🏰 DungeonFrame

### Immersive Storytelling Engine for Tabletop RPGs

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Version](https://img.shields.io/badge/Version-1.2.0-brightgreen)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**DungeonFrame** is a web-based visual engine designed for **Dungeon Masters** and storytellers who want to build, edit, and present immersive tabletop RPG scenes — all from the browser, with zero server dependencies.

🚀 **[Play Now: dd-maker.vercel.app](https://dd-maker.vercel.app)**

🇪🇸 **[Leer en Español](README-ES.md)**

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Story Management** | Create, rename, delete, import and export stories as ZIP (with assets) |
| 🗺️ **Scene Editor** | Visual canvas with drag-and-drop for maps, tokens and audio |
| 🎮 **Player Mode** | Fullscreen presentation mode with scene navigation and ambient audio |
| 📦 **Asset Vault** | Upload and organize maps, tokens and audio tracks |
| ⚙️ **Config Assets** | Configure token/asset types, player metadata and light radius from Home |
| 🔲 **Configurable Grid** | Toggle grid overlay with custom color and size per scene |
| 🌫️ **Fog of War** | Paint and erase fog in Editor, reveal explored areas in Player mode |
| 🎵 **Scene Audio** | Attach ambient music to each scene with auto-loop playback |
| 💾 **Local Persistence** | All data stored in IndexedDB via Dexie — no server required |
| 📤 **Import / Export** | Share stories between sessions as `.zip` files containing assets and asset configuration |
| ✨ **Effects & Auras** | Immersive animations and visual feedback on tokens |
| 🎬 **Cinematic Mode** | Automatic hiding of inactive UI in the player |
| ⚡ **Lazy Loading** | Performance optimization by deferring vault bundle |
| 🗑️ **Quick Delete** | Tokens can be deleted in real-time during gameplay |
| 🎲 **Integrated Dice** | Interactive floating panel to roll dice (d4 to d20) |
| ⚔️ **Initiative Tracker** | Integrated turn tracking system for combat |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[App.tsx] --> B[Home]
    A --> C[EditorView]
    A --> D[PlayerView]

    B --> E[(Dexie / IndexedDB)]
    C --> F[Vault]
    C --> G[EditorCanvas]
    C --> H[Timeline]
    D --> F
    D --> G

    G --> I[DraggableToken]
    G --> J[AssetImage]

    F --> E
    H --> K[Zustand Store]
    G --> K
    D --> K
    B --> K

    style A fill:#1a1a2e,stroke:#ffd700,color:#fff
    style K fill:#2d1b69,stroke:#ffd700,color:#fff
    style E fill:#0d3b66,stroke:#ffd700,color:#fff
```

---

## 🖥️ Application Views

### 🏠 Home — Story Dashboard

The landing page where you manage all your stories.

```
┌──────────────────────────────────────────────────────────┐
│                      DungeonFrame                        │
│              Immersive Storytelling Engine                │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │          │  │          │  │  Dragon   │  │  The     │ │
│  │  + New   │  │  Import  │  │  Keep     │  │  Crypt   │ │
│  │  Story   │  │  ZIP     │  │          │  │          │ │
│  │          │  │          │  │ ▶ Play   │  │ ▶ Play   │ │
│  │          │  │          │  │ ✏ Edit   │  │ ✏ Edit   │ │
│  │          │  │          │  │ ⬇ Export │  │ ⬇ Export │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Actions available per story:**
- ▶ **Play** — Launch in Player Mode
- ✏️ **Edit** — Open in the Scene Editor
- ⬇️ **Export** — Download as `.zip` (includes media)
- ⚙️ **Config Assets** — Open global asset configuration panel
- ✏️ **Rename** — Change story name
- 🗑️ **Delete** — Remove story

---

### ✏️ Editor — Scene Builder

The main workspace where you build your scenes.

```
┌────────────┬─────────────────────────────────────────────┐
│            │                                   [Back][Save]│
│   VAULT    │                                             │
│            │            EDITOR CANVAS                    │
│  [Maps]    │                                             │
│  [Tokens]  │     ┌───┐          ┌───┐                    │
│  [Audio]   │     │ 🧙 │         │ 🐉 │                   │
│            │     └───┘          └───┘                    │
│  ┌──────┐  │          ┌───┐                              │
│  │upload│  │          │ ⚔️ │                              │
│  └──────┘  │          └───┘                              │
│  ┌──┐┌──┐  │                                             │
│  │  ││  │  │    ░░░░░░░░░░░░   (grid overlay)            │
│  └──┘└──┘  │                                             │
├────────────┴─────────────────────────────────────────────┤
│  TIMELINE                                                │
│  [Scene 1] [Scene 2] [Scene 3]           [+ New Scene]   │
└──────────────────────────────────────────────────────────┘
```

**Key features:**
- **Vault Panel** (left) — Upload and browse Maps, Tokens, and Audio
- **Canvas** (center) — Drag assets from the Vault onto the canvas
- **Timeline** (bottom) — Create, select and manage scenes; toggle grid per scene
- **Drag & Drop** — Drag maps to set background, tokens to place on stage, audio to set music
- **Token Controls** — Hover over tokens to scale (±), toggle shape (circle/square), or delete

---

### 🎮 Player — Presentation Mode

The immersive view designed for live sessions.

```
┌──────────────────────────────────────────────────────────┐
│ [Back] [Vault] [Scenes] [Grid]                    [⛶]   │
│                                                          │
│                                                          │
│                                                          │
│  ◀              SCENE DISPLAY                       ▶    │
│                                                          │
│                  (fullscreen canvas)                      │
│                  (ambient audio loops)                    │
│                                                          │
│                                                          │
│                    Scene Name                            │
└──────────────────────────────────────────────────────────┘
```

**Controls:**
- ◀ / ▶ — Navigate between scenes
- **Vault** — Open token sidebar to place tokens during play
- **Scenes** — Quick scene selector dropdown
- **Grid** — Toggle grid overlay
- **⛶** — Toggle fullscreen mode
- Ambient music plays automatically and loops per scene

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 5.9 |
| **Bundler** | Vite 7 |
| **Styling** | TailwindCSS 4 + PostCSS |
| **State Management** | Zustand 5 |
| **Database** | Dexie 4 (IndexedDB wrapper) |
| **Drag & Drop** | react-draggable + @dnd-kit |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **IDs** | uuid v13 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.19
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/pentarix1996/D-DMaker.git
cd D-DMaker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AssetImage.tsx   # Renders assets from IndexedDB blobs
│   └── ui/
│       ├── Button.tsx   # Themed button component
│       └── GlassPanel.tsx # Glassmorphism panel
├── db/
│   └── index.ts         # Dexie database (stories, scenes, assets)
├── features/
│   ├── editor/
│   │   ├── DraggableToken.tsx  # Token with drag, scale, shape controls
│   │   ├── EditorCanvas.tsx    # Main canvas with drop zones
│   │   ├── EditorView.tsx      # Editor layout (Vault + Canvas + Timeline)
│   │   └── Timeline.tsx        # Scene strip with grid controls
│   ├── home/
│   │   └── Home.tsx            # Story dashboard (CRUD + import/export)
│   ├── player/
│   │   └── PlayerView.tsx      # Presentation mode with navigation
│   └── vault/
│       └── Vault.tsx           # Asset library (maps, tokens, audio)
├── hooks/
│   └── useAssets.ts     # Hook for CRUD operations on assets
├── store/
│   └── gameStore.ts     # Zustand store for session state
├── types/
│   └── index.ts         # TypeScript interfaces (Story, Scene, Asset…)
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
├── App.tsx              # Root component with view routing
├── main.tsx             # Entry point
├── App.css              # Application styles
└── index.css            # Global styles & Tailwind directives
```

---

## 📊 Data Model

```mermaid
erDiagram
    STORY ||--o{ SCENE : contains
    SCENE ||--o{ SCENE_ASSET : has
    ASSET ||--o{ SCENE_ASSET : referenced_by

    STORY {
        string id PK
        string name
        string createdAt
        string lastPlayed
        string theme
        blob thumbnail
    }

    SCENE {
        string id PK
        string storyId FK
        string name
        int order
        string backgroundAssetId
        string musicAssetId
        bool gridEnabled
        string gridColor
        int gridSize
    }

    ASSET {
        string id PK
        string name
        string type
        blob fileData
    }

    SCENE_ASSET {
        string id PK
        string assetId FK
        float x
        float y
        float scale
        string shape
    }
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📋 Changelog

See the full [Changelog](CHANGELOG.md) for a detailed history of all changes.

---

<div align="center">

**Built with ❤️ for Dungeon Masters everywhere**

*Roll initiative. Tell your story.*

</div>