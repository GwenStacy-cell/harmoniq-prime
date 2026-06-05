// ════════════════════════════════════════════════════════════════════════════
//  🎵  Harmony Music Bot  ·  index.js
//  Advanced Discord music bot with YouTube, Spotify, lyrics & filters
// ════════════════════════════════════════════════════════════════════════════

require('dotenv').config();

// ─── Single-Instance Lock ─────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const LOCK = path.join(__dirname, '.bot.lock');

if (fs.existsSync(LOCK)) {
  const pid = parseInt(fs.readFileSync(LOCK, 'utf8').trim(), 10);
  try {
    process.kill(pid, 0); // Check if that PID is still running
    console.error(`\n⚠️  Another bot instance is already running (PID ${pid})!`);
    console.error('   Close it first, or delete ".bot.lock" if it\'s stale.\n');
    process.exit(1);
  } catch {
    // Stale lock — previous process is dead, continue
    fs.unlinkSync(LOCK);
  }
}
fs.writeFileSync(LOCK, String(process.pid));
const cleanLock = () => { try { fs.unlinkSync(LOCK); } catch {} };
process.on('exit', cleanLock);
process.on('SIGINT', () => { cleanLock(); process.exit(); });
process.on('SIGTERM', () => { cleanLock(); process.exit(); });

const ffmpegPath = require('ffmpeg-static');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube }       = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YouTubePlugin } = require('@distube/youtube');
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
client.commands           = new Collection();   // Slash commands
client.nowPlayingMessages = new Map();           // guildId → Message (now-playing)
client.stay247            = new Set();           // guildIds in 24/7 mode

// ─── DisTube Setup ────────────────────────────────────────────────────────────
client.distube = new DisTube(client, {
  emitNewSongOnly:     true,
  joinNewVoiceChannel: true,
  customFilters:       CUSTOM_FILTERS,
  ffmpeg: {
    path: ffmpegPath,
  },
  plugins: [
    new YouTubePlugin({
      // Load YouTube cookies from file to bypass bot detection on server IPs
      // Create cookies.txt using the "Get cookies.txt LOCALLY" browser extension
      cookies: (() => {
        const cookieFile = path.join(__dirname, 'cookies.txt');
        if (fs.existsSync(cookieFile)) {
          console.log('🍪  YouTube cookies loaded from cookies.txt');
          return fs.readFileSync(cookieFile, 'utf8');
        }
        return undefined;
      })(),
    }),
    new SpotifyPlugin({    // ← Spotify → resolves to YouTube search
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
  // Silently ignore 40060 (interaction already acknowledged by another process)
  if (err?.code === 40060 || err?.code === 10062) return;
  console.error('[Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});
