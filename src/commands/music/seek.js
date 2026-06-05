const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');
const { formatTime } = require('../../utils/formatTime');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('⏩ Seek to a position in the current song')
    .addIntegerOption((opt) =>
      opt
        .setName('seconds')
        .setDescription('Position in seconds (e.g. 90 = 1:30)')
        .setRequired(true)
        .setMinValue(0)
    ),

  async execute(interaction) {
    const { guild, member } = interaction;

    if (!member.voice.channel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You need to be in a voice channel!')],
        ephemeral: true,
      });
    }

    const queue = interaction.client.distube.getQueue(guild);
    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('Nothing is playing right now!')],
        ephemeral: true,
      });
    }

    const seconds = interaction.options.getInteger('seconds');
    const song    = queue.songs[0];

    if (seconds >= song.duration) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            `Cannot seek beyond the song's duration (\`${song.formattedDuration}\`)!`
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.client.distube.seek(guild, seconds);
      await interaction.reply({
        embeds: [createSuccessEmbed(`⏩  Seeked to **${formatTime(seconds)}**`)],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [createErrorEmbed(err.message)],
        ephemeral: true,
      });
    }
  },
};
