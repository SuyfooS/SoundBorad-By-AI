# 🎛️ SoundBoard by suyfoo

A sleek desktop soundboard app built with Electron. Play sound effects in Discord voice chats, streams, or any voice app using VB-Cable — with mic passthrough so your friends hear both your voice and sounds.

## ✨ Features

- **Sound Pads** — Import MP3, WAV, OGG, WEBM, M4A, FLAC, AAC files and trigger them with a click or keyboard shortcut
- **Global Hotkeys** — Shortcuts work system-wide, even when the app is minimized. Supports A-Z, 0-9, F1-F12, Page Up/Down, arrows, numpad, and more
- **Mic Passthrough** — Route your real microphone through the app so Discord hears your voice + sounds mixed together
- **Monitor Mode** — Hear the sound effects yourself through your headphones while they play into Discord
- **VB-Cable Integration** — Output device selector to route audio to virtual cables for use in any voice app
- **Categories** — Organize sounds into custom categories with emoji icons
- **Favorites** — Pin your most-used sounds to the top of any view
- **Drag & Drop Reorder** — Rearrange pads by dragging them
- **Overlap / Cut Mode** — Choose whether sounds stack or interrupt each other
- **Random Play** — Play a random sound from the current category
- **Pad Size Toggle** — Switch between small, medium, and large grid layouts
- **Per-Sound Volume** — Individual volume sliders on every pad + master volume control
- **Sound Preview on Hover** — Quick 2-second preview when hovering over a pad
- **Custom Colors & Icons** — 12 neon colors and 32 emoji icons to personalize each sound
- **Keyboard Shortcuts Manager** — Visual panel to view, assign, and manage all hotkeys at once
- **Import / Export** — Backup your entire soundboard (including audio files) as a single JSON file
- **Stop All Global Hotkey** — Assign a dedicated key to instantly stop all playing sounds
- **System Tray** — Closing the window minimizes to tray; the app keeps running in the background
- **Persistent Settings** — All audio device selections, mic settings, monitor settings, and preferences are saved and restored automatically
- **Suyfoo Branding** — Clean, subtle branding throughout the app

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [VB-Cable](https://vb-audio.com/Cable/) (free virtual audio driver — needed for Discord integration)

### Installation

```bash
# Clone the repo
git clone https://github.com/suyfoo/soundboard.git
cd soundboard

# Install dependencies
npm install

# Run the app
npm start
```

### Build an Executable

```bash
npm run build
```

This creates a distributable `.exe` in the `dist/` folder using electron-builder.

## 🎧 Discord Setup

1. Install [VB-Cable](https://vb-audio.com/Cable/) and restart your PC
2. Open SoundBoard → **Output Device** → select **"CABLE Input"**
3. Toggle **Mic Passthrough** ON → select your real microphone
4. Toggle **Monitor** ON → select your headphones/speakers (so you hear the sounds too)
5. In Discord → Settings → Voice & Video → **Input Device** → select **"CABLE Output"**

Now Discord hears your voice + sound effects, and you can hear the effects yourself.

## ⌨️ Keyboard Shortcuts

| Action | Default |
|--------|---------|
| Play sound | Assigned key (1-9, A-Z, F1-F12, PgUp, etc.) |
| Stop all sounds | Custom (set via ⋯ menu → Set Stop All Hotkey) |
| Close menus | Esc |

Shortcuts are global — they work even when the app is minimized or another window is focused.

## 📁 Project Structure

```
SoundBoard/
├── main.js            # Electron main process (window, tray, file I/O, global shortcuts)
├── preload.js         # Secure IPC bridge between main and renderer
├── index.html         # Full UI (HTML + CSS + JS in a single file)
├── package.json       # Dependencies and build config
├── launch.bat         # Quick launcher (with console)
├── SoundBoard.vbs     # Quick launcher (no console window)
└── create-shortcut.vbs # Creates a desktop shortcut
```

## 🛠️ Tech Stack

- **Electron** — Desktop app framework
- **Web Audio API** — Audio routing and level metering
- **HTML/CSS/JS** — Single-file UI with no framework dependencies
- **VB-Cable** — Virtual audio driver for voice app integration

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

## 👤 Author

**suyfoo** — [suyfoo.com](https://suyfoo.com)
