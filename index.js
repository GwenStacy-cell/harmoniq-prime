// ════════════════════════════════════════════════════════════════════════════
//  🎵  Harmoniq Prime  ·  index.js
//  Advanced Discord music bot with YouTube (yt-dlp), Spotify, lyrics & filters
// ════════════════════════════════════════════════════════════════════════════

require('dotenv').config();

// ─── Single-Instance Lock ─────────────────────────────────────────────────────
// Skip when PM2 manages the process (PM2 handles restarts itself)
const fs   = require('fs');
const path = require('path');

if (process.env.pm_id === undefined) {
  const LOCK = path.join(__dirname, '.bot.lock');
  if (fs.existsSync(LOCK)) {
    const pid = parseInt(fs.readFileSync(LOCK, 'utf8').trim(), 10);
    try {
      process.kill(pid, 0);
      console.error(`\n⚠️  Another bot instance is already running (PID ${pid})!`);
      console.error('   Close it first, or delete ".bot.lock" if it\'s stale.\n');
      process.exit(1);
    } catch {
      fs.unlinkSync(LOCK); // stale lock — previous process is dead
    }
  }
  fs.writeFileSync(LOCK, String(process.pid));
  const cleanLock = () => { try { fs.unlinkSync(LOCK); } catch {} };
  process.on('exit', cleanLock);
  process.on('SIGINT',  () => { cleanLock(); process.exit(); });
  process.on('SIGTERM', () => { cleanLock(); process.exit(); });
}

const ffmpegPath = require('ffmpeg-static');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube }        = require('distube');
const { SpotifyPlugin }  = require('@distube/spotify');
const { YtDlpPlugin }    = require('./src/plugins/YtDlpPlugin');
const { CUSTOM_FILTERS } = require('./src/utils/filters');

// ─── Discord Client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── Shared State Collections ─────────────────────────────────────────────────
client.commands           = new Collection();
client.nowPlayingMessages = new Map();
client.stay247            = new Set();

// ─── DisTube Setup ────────────────────────────────────────────────────────────
const cookiesFile = path.join(__dirname, 'cookies.txt');
if (fs.existsSync(cookiesFile)) {
  console.log('🍪  YouTube cookies.txt found — will be used by yt-dlp');
}

client.distube = new DisTube(client, {
  emitNewSongOnly:     true,
  joinNewVoiceChannel: true,
  customFilters:       CUSTOM_FILTERS,
  ffmpeg: { path: ffmpegPath },
  plugins: [
    new YtDlpPlugin({
      // yt-dlp reads the cookies file directly — no parsing needed
      cookiesFile: fs.existsSync(cookiesFile) ? cookiesFile : null,
    }),
    new SpotifyPlugin({
      api: {
        clientId:     process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      },
    }),
  ],
});

// ─── Load Handlers ────────────────────────────────────────────────────────────
console.log('\n📂  Loading commands...');
require('./src/handlers/commandHandler').loadCommands(client);

console.log('\n📂  Loading client events...');
require('./src/handlers/eventHandler').loadEvents(client);

console.log('\n📂  Loading DisTube events...');
require('./src/handlers/distubeHandler').loadDistubeEvents(client);

// ─── Login ────────────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('\n❌  Failed to login:', err.message);
  process.exit(1);
});

// ─── Global Error Handlers ────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  if (err?.code === 40060 || err?.code === 10062) return; // ignore already-ack'd
  console.error('[Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});
