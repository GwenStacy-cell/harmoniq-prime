const { EmbedBuilder, MessageFlags } = require('discord.js');
const {
  createErrorEmbed,
  createSuccessEmbed,
  createNowPlayingEmbed,
  createMusicButtons,
  createQueueEmbed,
  COLORS,
} = require('../../utils/embeds');

// Shorthand for ephemeral flag (replaces deprecated ephemeral: true)
const EPHEMERAL = { flags: MessageFlags.Ephemeral };

// ─── Main interaction router ──────────────────────────────────────────────────
module.exports = {
  once: false,

  async execute(client, interaction) {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        // Silently ignore already-acknowledged errors (duplicate bot instances)
        if (error.code === 40060 || error.code === 10062) return;
        console.error(`[CMD ERROR] /${interaction.commandName}:`, error);
        const embed = createErrorEmbed(
          'An error occurred while running this command. Please try again.'
        );
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [embed] }).catch(() => {});
        } else {
          await interaction.reply({ embeds: [embed], ...EPHEMERAL }).catch(() => {});
        }
      }
      return;
    }

    // Button interactions
    if (interaction.isButton() && interaction.customId.startsWith('music_')) {
      await handleMusicButton(client, interaction);
      return;
    }

    // String select menus
    if (interaction.isStringSelectMenu() && interaction.customId === 'search_select') {
      await handleSearchSelect(client, interaction);
    }
  },
};

// ─── Music Button Handler ─────────────────────────────────────────────────────
async function handleMusicButton(client, interaction) {
  const { customId, guild, member } = interaction;
  const distube = client.distube;
  const queue   = distube.getQueue(guild);

  const needsVoice = !['music_queue', 'music_lyrics'].includes(customId);

  if (needsVoice && !member.voice.channel) {
    return interaction.reply({
      embeds: [createErrorEmbed('Join a voice channel first!')],
      ...EPHEMERAL,
    });
  }

  if (!queue && customId !== 'music_queue') {
    return interaction.reply({
      embeds: [createErrorEmbed('Nothing is playing right now!')],
      ...EPHEMERAL,
    });
  }

  try {
    switch (customId) {
      case 'music_pause': {
        if (queue.paused) {
          distube.resume(guild);
          await interaction.reply({ embeds: [createSuccessEmbed('▶️  Resumed the music!')], ...EPHEMERAL });
        } else {
          distube.pause(guild);
          await interaction.reply({ embeds: [createSuccessEmbed('⏸️  Paused the music!')], ...EPHEMERAL });
        }
        await refreshNowPlayingMessage(client, guild);
        break;
      }

      case 'music_skip': {
        const skipped = queue.songs[0]?.name || 'current song';
        await distube.skip(guild);
        await interaction.reply({ embeds: [createSuccessEmbed(`⏭️  Skipped **${skipped}**!`)], ...EPHEMERAL });
        break;
      }

      case 'music_back': {
        await distube.previous(guild);
        await interaction.reply({ embeds: [createSuccessEmbed('⏮️  Going back to the previous song!')], ...EPHEMERAL });
        break;
      }

      case 'music_stop': {
        clearNowPlayingMessage(client, guild);
        distube.stop(guild);
        await interaction.reply({ embeds: [createSuccessEmbed('⏹️  Stopped and cleared the queue!')], ...EPHEMERAL });
        break;
      }

      case 'music_loop': {
        const newMode = (queue.repeatMode + 1) % 3;
        distube.setRepeatMode(guild, newMode);
        const modes = ['Off', '🔂 Song', '🔁 Queue'];
        await interaction.reply({ embeds: [createSuccessEmbed(`Loop mode: **${modes[newMode]}**`)], ...EPHEMERAL });
        await refreshNowPlayingMessage(client, guild);
        break;
      }

      case 'music_shuffle': {
        distube.shuffle(guild);
        await interaction.reply({ embeds: [createSuccessEmbed('🔀  Queue shuffled!')], ...EPHEMERAL });
        break;
      }

      case 'music_volume_down': {
        const newVol = Math.max(0, (queue.volume || 100) - 10);
        distube.setVolume(guild, newVol);
        await interaction.reply({ embeds: [createSuccessEmbed(`🔉  Volume: **${newVol}%**`)], ...EPHEMERAL });
        await refreshNowPlayingMessage(client, guild);
        break;
      }

      case 'music_autoplay': {
        const ap = client.distube.toggleAutoplay(guild);
        await interaction.reply({ embeds: [createSuccessEmbed(`🎲  Autoplay **${ap ? 'enabled' : 'disabled'}**!`)], ...EPHEMERAL });
        await refreshNowPlayingMessage(client, guild);
        break;
      }

      case 'music_queue': {
        if (!queue || !queue.songs.length) {
          return interaction.reply({ embeds: [createErrorEmbed('The queue is empty!')], ...EPHEMERAL });
        }
        await interaction.reply({ embeds: [createQueueEmbed(queue, 0)], ...EPHEMERAL });
        break;
      }

      case 'music_lyrics': {
        const songName = queue?.songs[0]?.name;
        await fetchAndShowLyrics(interaction, songName);
        break;
      }
    }
  } catch (error) {
    console.error('[BUTTON ERROR]', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction
        .reply({ embeds: [createErrorEmbed(error.message || 'Something went wrong!')], ...EPHEMERAL })
        .catch(() => {});
    }
  }
}

// ─── Search Select Handler ────────────────────────────────────────────────────
async function handleSearchSelect(client, interaction) {
  await interaction.deferUpdate();

  const url     = interaction.values[0];
  const channel = interaction.member.voice.channel;

  if (!channel) {
    return interaction.editReply({
      embeds: [createErrorEmbed('Join a voice channel first!')],
      components: [],
    });
  }

  try {
    await client.distube.play(channel, url, {
      member:      interaction.member,
      textChannel: interaction.channel,
    });
    await interaction.editReply({ embeds: [createSuccessEmbed('✅  Added to queue!')], components: [] });
  } catch (error) {
    await interaction.editReply({ embeds: [createErrorEmbed(error.message)], components: [] });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function refreshNowPlayingMessage(client, guild) {
  const stored = client.nowPlayingMessages?.get(guild.id);
  if (!stored) return;

  const queue = client.distube.getQueue(guild);
  if (!queue) return;

  try {
    await stored.edit({
      embeds:     [createNowPlayingEmbed(queue, queue.songs[0])],
      components: createMusicButtons(queue),
    });
  } catch {
    client.nowPlayingMessages.delete(guild.id);
  }
}

function clearNowPlayingMessage(client, guild) {
  const stored = client.nowPlayingMessages?.get(guild.id);
  if (stored) {
    stored.delete().catch(() => {});
    client.nowPlayingMessages.delete(guild.id);
  }
}

async function fetchAndShowLyrics(interaction, songName) {
  if (!songName) {
    return interaction.reply({
      embeds: [createErrorEmbed('No song is currently playing!')],
      ...EPHEMERAL,
    });
  }

  await interaction.deferReply({ ...EPHEMERAL });

  try {
    const Genius       = require('genius-lyrics');
    const geniusClient = new Genius.Client(process.env.GENIUS_API_KEY);
    const results      = await geniusClient.songs.search(songName);

    if (!results.length) {
      return interaction.editReply({ embeds: [createErrorEmbed('Lyrics not found!')] });
    }

    const song   = results[0];
    const lyrics = await song.lyrics();

    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setAuthor({ name: '🎤  Lyrics' })
      .setTitle(`${song.title} — ${song.artist.name}`)
      .setURL(song.url)
      .setDescription(lyrics.slice(0, 4000) + (lyrics.length > 4000 ? '...' : ''))
      .setFooter({ text: 'Powered by Genius' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[LYRICS ERROR]', err);
    return interaction.editReply({ embeds: [createErrorEmbed('Could not fetch lyrics!')] });
  }
}
