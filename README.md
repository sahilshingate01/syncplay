# 🎬 SyncPlay

> **Synchronized local movie playback across multiple Macs and devices connected to the same local network.**

SyncPlay is a high-precision, zero-upload web application designed for synchronized movie nights over local Wi-Fi / LAN. Movie files stay 100% on each user's device, while playback timing, commands, chat, and room state are synchronized with sub-frame precision using WebSockets and NTP clock synchronization.

---

## ✨ Features & Architecture

- **🔒 100% Zero Video Upload**: Video files never leave your Mac. Each device loads its own local video copy (`.mp4`, `.webm`, `.mov`, `.mkv`) directly in memory via the HTML5 File API and `URL.createObjectURL()`.
- **⚡ High-Precision NTP Clock Sync**: Continuously calculates clock offsets and network latency between clients and the server to maintain sub-millisecond synchronization.
- **⏱️ Timestamp-Based Playback (`PLAY_AT`)**: Instead of naive play signals, scheduled future timestamps allow all devices to start and resume playback at the exact same physical instant.
- **🌊 Continuous Drift Correction**: Transparently micro-adjusts playback rate (`0.99x` – `1.01x`) for minor drift (30ms–350ms) to keep audio and video in lockstep without pitch distortion or stutter.
- **🎨 Pastel SaaS Design Language**: Recreated directly from modern dashboard aesthetics with soft lavender, peach, and mint gradients, rounded cards (`rounded-3xl`), subtle borders (`rgba(20,20,30,0.06)`), and clean typography.
- **🍿 Interactive Room Chat**: Real-time room chat with pastel-coded message bubbles and quick reaction emojis.
- **📱 Instant LAN Discovery & QR Codes**: One-click invite modal with auto-detected local IP address (`http://192.168.x.x:3001`) and QR code for joining from iPads, iPhones, or other laptops.
- **🎛️ Host & Participant Permissions**: Granular controls (Host-Only vs Everyone control modes, device kick, and host migration).
- **🎬 Built-In Open Demo Videos**: High-definition open-source sample movies (Interstellar demo, Tears of Steel, Sintel, Elephant's Dream) included for instant multi-device testing out-of-the-box.

---

## 🚀 Quick Start

### 1. Installation

Clone or open the repository and install all dependencies:

```bash
npm run install:all
```

*(Or simply `npm install && cd client && npm install`)*

### 2. Build & Run

Start the unified SyncPlay server:

```bash
npm run dev
```

Upon launching, the terminal displays your local and LAN URLs:

```text
======================================================
🎬  SyncPlay Server is running!
======================================================
📡 Local Host:       http://localhost:3001
🌐 Local Network:    http://192.168.1.10:3001
------------------------------------------------------
🔒 Zero-Upload Policy: Movie files never leave your device.
⚡ High-Precision NTP Clock Sync & WebSockets active.
======================================================
```

---

## 👥 How to Watch Together (Step-by-Step)

### Device A (Host Mac):
1. Open `http://localhost:3001` (or `http://192.168.1.x:3001`) in your browser.
2. Click **Create a Room** (e.g. `Movie Night Room`).
3. Click **Open File** to pick your local movie file from your Mac (or choose one of the built-in demo clips).
4. Click **Invite Friends** to copy your room code (`MN-7X9P`) or LAN link.

### Device B & C (Guest Macs / Laptops / iPads):
1. Connect to the **same Wi-Fi network**.
2. Open the LAN address (e.g. `http://192.168.1.10:3001/?room=MN-7X9P`) or scan the QR code.
3. Click **Open File** to pick your local copy of the same movie file.
4. Click **"Enable Playback"** if prompted to unlock browser audio autoplay.

When the Host presses **Play**, all devices will start in physical lockstep!

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Canvas Confetti, QRCode SVG
- **Backend**: Node.js, Express, `ws` (WebSockets)
- **Video Engine**: HTML5 `<video>` element with Blob Object URLs
- **Timing Engine**: Custom NTP clock synchronization & rate-compensating drift controller

---

## 📁 Project Structure

```text
syncplay/
├── package.json               # Root scripts & server dependencies
├── README.md                  # Documentation & LAN guide
├── server/
│   ├── index.js               # Express + WebSocket HTTP server & REST endpoints
│   ├── rooms.js               # Room state, client sessions & chat registry
│   ├── syncEngine.js          # NTP clock sync, PLAY_AT scheduler & drift coordinator
│   └── networkUtils.js        # LAN IP auto-detection
└── client/
    ├── package.json           # Frontend dependencies (React, Vite, Tailwind)
    ├── vite.config.js         # Vite configuration with LAN host binding
    ├── tailwind.config.js     # Custom pastel color tokens & shadow system
    └── src/
        ├── App.jsx            # Root application layout & view routing
        ├── components/
        │   ├── Sidebar.jsx            # Left navigation & user profile
        │   ├── RoomHeader.jsx         # Gradient card with room code & LAN status
        │   ├── NowPlayingCard.jsx     # Video player, metadata, scrubber & transport
        │   ├── PlaybackControls.jsx   # 4 Pastel action cards (Play, Pause, Seek, Sync Now)
        │   ├── SyncStatusCard.jsx     # Device offset telemetry cards
        │   ├── ConnectedDevices.jsx   # Right panel connected devices list
        │   ├── RoomChat.jsx           # Right panel room chat with pastel bubbles
        │   ├── OnboardingModal.jsx    # Create/Join room landing modal
        │   ├── InviteFriendsModal.jsx # QR code and shareable LAN link modal
        │   ├── ManageDevicesModal.jsx # Host permissions & kick tools
        │   ├── SettingsView.jsx       # Room configuration & privacy settings
        │   ├── PlaylistView.jsx       # Synced multi-movie queue
        │   ├── DevicesView.jsx        # Full diagnostic network telemetry
        │   ├── TheaterView.jsx        # Cinematic theater viewing mode
        │   └── AutoplayBanner.jsx     # Browser audio unlock handler
        ├── hooks/
        │   ├── useSyncPlay.js         # WebSocket & NTP sync hook
        │   └── useLocalVideo.js       # Local File API, HTML5 video & drift compensation
        └── utils/
            ├── timeUtils.js           # Time formatting & clock mathematics
            ├── fileFingerprint.js     # Zero-upload client-side file matcher
            └── demoVideos.js          # Built-in open demo movie catalog
```

---

## 🛡️ Privacy & Security Guarantee

SyncPlay strictly operates on a **zero video transfer** model. The server only receives lightweight metadata (timestamps, play/pause commands, chat messages, and device names). Movie video streams are rendered exclusively from local disk memory and never leave your hardware.
