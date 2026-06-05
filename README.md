# 🎵 Harmony Music Bot

An advanced Discord music bot with Spotify, YouTube, lyrics, audio filters, and rich interactive controls.

## ✨ Features

- 🎵 **Play** from YouTube (search or URL) and Spotify (tracks, albums, playlists)
- ⏸️ **Full Playback Control** — play, pause, resume, skip, back, stop, seek
- 📋 **Queue Management** — view, shuffle, loop, remove, move, clear, jump
- 🎛️ **18 Audio Filters** — bassboost, nightcore, 8D, vaporwave, karaoke, echo, and more
- 🎤 **Lyrics** — fetch lyrics via Genius API
- 🔍 **Search** — interactive dropdown to pick from 10 results
- 🎲 **Autoplay** — automatically plays related songs
- 📻 **24/7 Mode** — stays in voice channel indefinitely
- 🎹 **Interactive Button Controls** — on every Now Playing embed
- 📊 **Rich Embeds** — progress bars, thumbnails, volume bars

## 📦 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials (already done if provided).

### 3. Deploy Slash Commands (run once)
```bash
node deploy-commands.js
```
> ⚠️ Global commands may take up to 1 hour to appear in all servers.

### 4. Start the Bot
```bash
node index.js
```

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `/play <query>` | Play from YouTube or Spotify |
| `/pause` | Pause current song |
| `/resume` | Resume paused song |
| `/skip` | Skip to next song |
| `/back` | Go back to previous song |
| `/stop` | Stop and clear queue |
| `/seek <seconds>` | Seek to position |
| `/nowplaying` | Show now-playing card |
| `/queue` | View queue (paginated) |
| `/shuffle` | Shuffle the queue |
| `/loop <mode>` | Loop: off/song/queue |
| `/remove <pos>` | Remove song from queue |
| `/move <from> <to>` | Reposition song |
| `/clear` | Clear queue |
| `/jump <pos>` | Jump to position |
| `/volume <1-100>` | Set volume |
| `/filter add/remove/list/clear` | Audio filters |
| `/autoplay` | Toggle autoplay |
| `/247` | Toggle 24/7 mode |
| `/search <query>` | Search with dropdown |
| `/lyrics [song]` | Get lyrics |
| `/ping` | Check latency |
| `/help` | Show all commands |

## 🎛️ Audio Filters

`bassboost` `8d` `nightcore` `vaporwave` `karaoke` `echo` `flanger` `tremolo` `vibrato` `reverse` `treble` `normalizer` `surrounding` `pulsator` `phaser` `daycore` `lofi` `earrape`

## 🔧 Requirements

- Node.js 18+
- FFmpeg (included via `ffmpeg-static`)
- Discord Bot Token
- Spotify API credentials
- Genius API key (optional, for lyrics)
