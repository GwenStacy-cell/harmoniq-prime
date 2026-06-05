const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createProgressBar } = require('./progressBar');
const { formatTime } = require('./formatTime');

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary:  0x7B2FBE,  // Deep Purple
  success:  0x00D26A,  // Emerald Green
  error:    0xFF4757,  // Vivid Red
  warning:  0xFFA502,  // Amber
  info:     0x1E90FF,  // Dodger Blue
  neutral:  0x2F3136,  // Discord Dark
  gold:     0xFFD700,  // Gold
};

// ─── Basic Embeds ─────────────────────────────────────────────────────────────

function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setDescription(`❌  **${message}**`)
    .setTimestamp();
}

function createSuccessEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setDescription(`✅  **${message}**`)
    .setTimestamp();
}

function createWarningEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.warning)
    .setDescription(`⚠️  **${message}**`)
    .setTimestamp();
}

function createInfoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

// ─── Now Playing Embed ────────────────────────────────────────────────────────

/**
 * Build the rich "Now Playing" embed with progress bar and metadata.
 * @param {import('distube').Queue} queue
 * @param {import('distube').Song} song
 */
function createNowPlayingEmbed(queue, song) {
  const currentTime = Math.floor(queue.currentTime || 0);
  const totalTime   = song.duration || 0;

  const progressBar = createProgressBar(currentTime, totalTime);
  const current     = formatTime(currentTime);
  const total       = song.formattedDuration || formatTime(totalTime);

  const loopLabels = ['Off', '🔂 Song', '🔁 Queue'];
  const loopIcon   = ['▪️', '🔂', '🔁'][queue.repeatMode] || '▪️';

  const sourceIcon = song.url?.includes('spotify') ? '<:spotify:1234> Spotify' : '▶️ YouTube';

  const embed = new EmbedBuilder()
    .setColor(COLORS.primary)
    .setAuthor({
      name: '🎵  Now Playing',
    })
    .setTitle(song.name || 'Unknown Track')
    .setURL(song.url || null)
    .setDescription(
      [
        `> 👤  **${song.uploader?.name || 'Unknown Artist'}**`,
        `> ⏱️  **Duration:** \`${total}\``,
        `> 👆  **Requested by:** ${song.user?.toString() || 'Unknown'}`,
        '',
        `${progressBar}`,
        `\`${current}\` ${' '.repeat(2)} / ${' '.repeat(2)} \`${total}\``,
      ].join('\n')
    )
    .addFields([
      {
        name: '🔉 Volume',
        value: `**${queue.volume}%**\n${'█'.repeat(Math.round(queue.volume / 10))}${'░'.repeat(10 - Math.round(queue.volume / 10))}`,
        inline: true,
      },
      {
        name: `${loopIcon} Loop`,
        value: `**${loopLabels[queue.repeatMode] || 'Off'}**`,
        inline: true,
      },
      {
        name: '🎲 Autoplay',
        value: `**${queue.autoplay ? 'On' : 'Off'}**`,
        inline: true,
      },
    ])
    .setTimestamp();

  if (song.thumbnail) embed.setThumbnail(song.thumbnail);

  return embed;
}

// ─── Music Control Buttons ────────────────────────────────────────────────────

/**
 * Build two rows of interactive music control buttons.
 * @param {import('distube').Queue | null} queue
 */
function createMusicButtons(queue) {
  const isPaused = queue?.paused ?? false;
  const isLooped = (queue?.repeatMode ?? 0) > 0;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_back')
      .setEmoji('⏮️')
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_pause')
      .setEmoji(isPaused ? '▶️' : '⏸️')
      .setLabel(isPaused ? 'Resume' : 'Pause')
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setEmoji('⏭️')
      .setLabel('Skip')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setEmoji('🔁')
      .setLabel('Loop')
      .setStyle(isLooped ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_shuffle')
      .setEmoji('🔀')
      .setLabel('Shuffle')
      .setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_volume_down')
      .setEmoji('🔉')
      .setLabel('Vol -')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_lyrics')
      .setEmoji('🎤')
      .setLabel('Lyrics')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_queue')
      .setEmoji('📋')
      .setLabel('Queue')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_autoplay')
      .setEmoji('🎲')
      .setLabel('Autoplay')
      .setStyle(queue?.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setEmoji('⏹️')
      .setLabel('Stop')
      .setStyle(ButtonStyle.Danger),
  );

  return [row1, row2];
}

// ─── Queue Embed ──────────────────────────────────────────────────────────────

/**
 * Build a paginated queue embed.
 * @param {import('distube').Queue} queue
 * @param {number} page - 0-indexed page number
 */
function createQueueEmbed(queue, page = 0) {
  const ITEMS_PER_PAGE = 10;
  const songs          = queue.songs;
  const upcoming       = songs.slice(1); // exclude current
  const totalPages     = Math.max(1, Math.ceil(upcoming.length / ITEMS_PER_PAGE));
  const start          = page * ITEMS_PER_PAGE;
  const end            = start + ITEMS_PER_PAGE;

  const queueList = upcoming
    .slice(start, end)
    .map(
      (s, i) =>
        `\`${start + i + 1}.\` [${s.name}](${s.url})\n` +
        `    └ 👤 ${s.uploader?.name || 'Unknown'} • ⏱️ \`${s.formattedDuration || '?'}\``
    )
    .join('\n');

  const current = songs[0];

  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setAuthor({ name: '📋  Music Queue' })
    .setTitle(queue.textChannel?.guild?.name ? `${queue.textChannel.guild.name}'s Queue` : 'Queue')
    .setDescription(
      [
        '**▶️  Now Playing:**',
        `[${current?.name || 'Unknown'}](${current?.url || '#'})`,
        `└ 👤 ${current?.uploader?.name || 'Unknown'} • ⏱️ \`${current?.formattedDuration || '?'}\``,
        '',
        upcoming.length > 0
          ? `**🎵  Up Next:**\n${queueList}`
          : '*No more songs in the queue.*',
      ].join('\n')
    )
    .addFields([
      { name: '🎵 Songs',          value: `**${songs.length}**`,                              inline: true },
      { name: '⏱️ Total Duration', value: `**${queue.formattedDuration || 'Unknown'}**`,       inline: true },
      { name: '🔉 Volume',         value: `**${queue.volume}%**`,                             inline: true },
    ])
    .setFooter({ text: `Page ${page + 1} / ${totalPages}  •  ${songs.length} song(s) total` })
    .setTimestamp();
}

// ─── Added to Queue Embed ─────────────────────────────────────────────────────

function createAddedToQueueEmbed(song, queue) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setAuthor({ name: '✅  Added to Queue' })
    .setTitle(song.name || 'Unknown Track')
    .setURL(song.url || null)
    .addFields([
      { name: '👤 Artist',   value: song.uploader?.name || 'Unknown',        inline: true },
      { name: '⏱️ Duration', value: song.formattedDuration || 'Unknown',     inline: true },
      { name: '📍 Position', value: `#${queue.songs.length}`,                 inline: true },
    ])
    .setThumbnail(song.thumbnail || null)
    .setTimestamp();
}

// ─── Added Playlist Embed ─────────────────────────────────────────────────────

function createAddedPlaylistEmbed(playlist, queue) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setAuthor({ name: '✅  Playlist Added to Queue' })
    .setTitle(playlist.name || 'Unknown Playlist')
    .setURL(playlist.url || null)
    .addFields([
      { name: '🎵 Songs',      value: `**${playlist.songs?.length || 0}** tracks`, inline: true },
      { name: '⏱️ Duration',   value: playlist.formattedDuration || 'Unknown',     inline: true },
      { name: '📍 Queue Size', value: `**${queue.songs.length}** total`,           inline: true },
    ])
    .setThumbnail(
      playlist.thumbnail ||
        playlist.songs?.[0]?.thumbnail ||
        null
    )
    .setTimestamp();
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  COLORS,
  createErrorEmbed,
  createSuccessEmbed,
  createWarningEmbed,
  createInfoEmbed,
  createNowPlayingEmbed,
  createMusicButtons,
  createQueueEmbed,
  createAddedToQueueEmbed,
  createAddedPlaylistEmbed,
};
