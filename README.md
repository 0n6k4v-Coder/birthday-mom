# 🎂 Birthday Mom

An interactive 3D birthday web experience created as a special birthday gift for Mom.

The website combines a cute 3D mother character, a 3D cat companion, an interactive postcard with a flip-card music player, and a pastel-themed design into one small, personalized birthday experience.

## ✨ Features

* **Splash Screen** — A paper-themed loading screen with cake and loading dots that hides automatically once the 3D models finish loading.

* **3D Characters** — Two `<model-viewer>` GLB models rendered side by side:
  * A mother character (left)
  * A stylized white cat companion (right)

* **Interactive Postcard** — A floating mail (FAB) button opens a 3D card-flip overlay:
  * Flip the card to reveal the music side
  * Personalized birthday message on the front
  * Notebook-style music paper with decorative music notes

* **Music Player** — A built-in HTML5 audio player on the music side of the postcard:
  * Play / Pause, Restart (to the 15-second mark), Mute / Unmute
  * Interactive progress bar with click-to-seek and keyboard arrow seek
  * Current / total time display
  * Music begins playing when the postcard is flipped to the music side (not when the mail button is opened)

* **Visual Design** — A soft pastel color palette with:
  * Gradient backgrounds and paper textures
  * Hand-drawn style elements (tape, stamps, postmarks, lines)
  * Gentle floating and pulse animations
  * `prefers-reduced-motion` support

* **Responsive Layout** — A three-layer grid layout that fits within a single `100dvh` viewport across desktop, tablet, and mobile.

## 🛠️ Tech Stack

* HTML5
* CSS3 (fluid `clamp()`-based responsive sizing, CSS Grid, `@media` breakpoints)
* Vanilla JavaScript (no frameworks)
* [Google Model Viewer](https://modelviewer.dev/) — `<model-viewer>` for 3D GLB rendering
* Google Fonts — Quicksand (body) and Caveat (handwriting)
* [Material Symbols](https://fonts.google.com/icons) — Outlined icons via Google Fonts
* HTML5 Audio API
* [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) (PWA metadata)

## 📁 Project Structure

```text
birthday-mom/
├── index.html          # Main page: splash, header, 3D stage, postcard overlay
├── manifest.json       # PWA manifest (theme colors, display mode)
├── README.md           # This file
├── css/
│   ├── splash.css      # Splash-screen styling
│   └── style.css       # Main styles: 3-layer layout, 3D stage, postcard, player
├── js/
│   └── main.js         # Interactivity: splash hide, postcard flip, music player
└── assets/
    ├── audio/
    │   └── birthday-song.mp3
    ├── icons/
    │   ├── favicon.svg
    │   ├── favicon-16x16.png
    │   ├── favicon-32x32.png
    │   ├── favicon.ico
    │   ├── apple-touch-icon.png
    │   ├── android-chrome-192x192.png
    │   └── android-chrome-512x512.png
    ├── images/
    │   └── mom-birthday-cover.png
    └── models/
        ├── asian-woman-3d-model.glb
        └── stylized-white-cat-3d-model.glb
```

## 🏗️ Layout Architecture

The page uses a **three-layer CSS Grid** layout on `<body>`:

1. **Header** (`.site-header`) — Birthday title and subtitle, top of the page.
2. **3D Stage** (`.stage`, `grid-row: 2`) — The main content area. It receives its height from the flexible middle grid track (`1fr`) and contains the two `<model-viewer>` models plus a ground shadow.
3. **Message Layer** (`.message-layer`, `grid-row: 3`) — Contains the floating mail button (FAB) that opens the postcard.

The postcard itself is a **fixed modal overlay** (`position: fixed`) that appears above all layers when activated. It is not part of the three-layer page flow.

### Breakpoints

* `@media (max-width: 768px)` — Adjusts stage glow positioning for tablets.
* `@media (max-width: 712px)` — Reduces FAB glow and pulse-ring scale on small mobile screens to prevent viewport overflow.

## 🚀 Getting Started

Because the project uses 3D models and external assets, run it through a local web server rather than opening `index.html` directly.

### Option 1 — Python (no dependencies)

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2 — VS Code Live Server

Install the **Live Server** extension, then right-click `index.html` and select **Open with Live Server**.

## 🌐 Browser / Runtime Requirements

* A **modern browser** (Chrome, Edge, Firefox, Safari)
* **JavaScript enabled**
* **WebGL support** — required for the `<model-viewer>` 3D characters
* **User interaction required for audio** — the music player only begins playback after the user flips the postcard to the music side, complying with browser autoplay policies

## 🎨 Customization

### 3D Models

Update the `src` attribute in `index.html`:

* Mother model: `./assets/models/asian-woman-3d-model.glb`
* Cat model: `./assets/models/stylized-white-cat-3d-model.glb`

Replace the corresponding `.glb` file in `assets/models/` and update the `src` path.

### Birthday Message

The front of the postcard text can be edited directly in the `.postcard-front` section of `index.html`.

### Album Artwork

Replace `assets/images/mom-birthday-cover.png` with your preferred artwork. The `<img>` source in `index.html` already points to this path.

### Music

Replace `assets/audio/birthday-song.mp3` with your preferred audio file. The player in `js/main.js` starts playback at 15 seconds by default (see `MUSIC_START_TIME`).

### Styling

All visual styles live in:

* `css/style.css` — Main layout, postcard, and player styles
* `css/splash.css` — Splash-screen styles
* Critical splash CSS is inlined in the `<head>` of `index.html` for fast first paint.

### Favicon / Site Icon

The primary site icon is:

```text
assets/icons/favicon.svg
```

Additional icon formats are also provided for browser and device compatibility:

```text
assets/icons/
├── favicon.svg              # Primary SVG (served as the page favicon)
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon.ico
├── apple-touch-icon.png
├── android-chrome-192x192.png
└── android-chrome-512x512.png
```

`index.html` references `favicon.svg` as the primary icon and the PNG/ICO variants as fallbacks. `manifest.json` declares the Android Chrome icons for PWA installation.

## 💝 Purpose

This project was created as a personal digital birthday card for Mom — combining web development, 3D graphics, animation, and music into one interactive experience.

> Sometimes a small website can become a very personal gift. ❤️

## 📄 License

This project is a personal gift project and is **not released under a formal open-source license**.

If you reuse this project, make sure you have the appropriate rights to any third-party assets:

* 3D models (`.glb` files in `assets/models/`)
* Images (`assets/images/`)
* Music (`assets/audio/`)
* Fonts (Quicksand, Caveat, Material Symbols)

---

Made with ❤️ for Mom.