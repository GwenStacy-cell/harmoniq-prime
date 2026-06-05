const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createErrorEmbed, COLORS } = require('../../utils/embeds');
const Genius = require('genius-lyrics');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('🎤 Find lyrics for a song')
    .addStringOption((opt) =>
      opt
        .setName('song')
        .setDescription('Song name (leave blank to use currently playing song)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let query = interaction.options.getString('song');

    // Fall back to currently playing song if no query given
    if (!query) {
      const queue = interaction.client.distube.getQueue(interaction.guild);
      if (!queue || !queue.songs[0]) {
        return interaction.editReply({
          embeds: [
            createErrorEmbed(
              'No song is currently playing! Provide a song name or start playing something.'
            ),
          ],
        });
      }
      query = queue.songs[0].name;
    }

    try {
      const geniusClient = new Genius.Client(process.env.GENIUS_API_KEY);
      const results      = await geniusClient.songs.search(query);

      if (!results || results.length === 0) {
        return interaction.editReply({
          embeds: [createErrorEmbed(`No lyrics found for **${query}**!`)],
        });
      }

      const song   = results[0];
      const lyrics = await song.lyrics();

      if (!lyrics || lyrics.trim().length === 0) {
        return interaction.editReply({
          embeds: [createErrorEmbed('Lyrics are empty or unavailable for this song.')],
        });
      }

      // Split into pages of ≤4000 chars at line breaks
      const pages = splitLyrics(lyrics, 4000);

      // Build embeds for each page
      const embeds = pages.map((chunk, idx) =>
        new EmbedBuilder()
          .setColor(COLORS.primary)
          .setAuthor({ name: '🎤  Lyrics' })
          .setTitle(idx === 0 ? `${song.title} — ${song.artist.name}` : null)
          .setURL(idx === 0 ? song.url : null)
          .setDescription(chunk)
          .setFooter({
            text:
              pages.length > 1
                ? `Page ${idx + 1} of ${pages.length} • Powered by Genius`
                : 'Powered by Genius',
          })
          .setTimestamp(idx === 0 ? new Date() : null)
      );

      // Send first embed as the interaction reply
      await interaction.editReply({ embeds: [embeds[0]] });

      // Send remaining pages as follow-ups (up to 4 more = 5 total)
      for (let i = 1; i < Math.min(embeds.length, 5); i++) {
        await interaction.followUp({ embeds: [embeds[i]] });
      }

      if (pages.length > 5) {
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.warning)
              .setDescription(
                `⚠️  Lyrics too long to display fully. [View full lyrics on Genius](${song.url})`
              ),
          ],
        });
      }
    } catch (err) {
      console.error('[/lyrics]', err.message);
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            'Could not fetch lyrics. Try a more specific search (e.g. `Song Name - Artist`).'
          ),
        ],
      });
    }
  },
};

/**
 * Split lyrics string into chunks of ≤maxLen chars at line breaks.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string[]}
 */
function splitLyrics(text, maxLen) {
  const chunks = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    const breakAt = remaining.lastIndexOf('\n', maxLen);
    if (breakAt <= 0) {
      chunks.push(remaining.slice(0, maxLen));
      remaining = remaining.slice(maxLen).trimStart();
    } else {
      chunks.push(remaining.slice(0, breakAt).trimEnd());
      remaining = remaining.slice(breakAt + 1).trimStart();
    }
  }

  return chunks.filter((c) => c.length > 0);
}
