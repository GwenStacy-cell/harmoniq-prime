// ════════════════════════════════════════════════════════════════════════════
//  🎵  Harmony Music Bot  ·  index.js
//  Advanced Discord music bot with YouTube, Spotify, lyrics & filters
// ════════════════════════════════════════════════════════════════════════════

require('dotenv').config();

const ffmpegPath = require('ffmpeg-static');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
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
  emitNewSongOnly:       true,    // Only fire playSong on new songs (not restarts)
  joinNewVoiceChannel:   true,
  customFilters:         CUSTOM_FILTERS,
  ffmpeg: {
    path: ffmpegPath,
  },
  plugins: [
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
  console.error('[Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});
