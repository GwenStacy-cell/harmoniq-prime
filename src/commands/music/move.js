const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('↔️ Move a song to a different position in the queue')
    .addIntegerOption((opt) =>
      opt.setName('from').setDescription('Current position of the song').setRequired(true).setMinValue(1)
    )
    .addIntegerOption((opt) =>
      opt.setName('to').setDescription('New position for the song').setRequired(true).setMinValue(1)
    ),

  async execute(interaction) {
    const { guild, member } = interaction;

    if (!member.voice.channel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You need to be in a voice channel!')],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    const queue = interaction.client.distube.getQueue(guild);
    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('Nothing is playing right now!')],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    const from  = interaction.options.getInteger('from');
    const to    = interaction.options.getInteger('to');
    const songs = queue.songs;
    const max   = songs.length - 1;

    if (from > max || to > max) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Invalid position! Queue has **${max}** upcoming song(s).`)],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    if (from === to) {
      return interaction.reply({
        embeds: [createErrorEmbed('`from` and `to` positions are the same!')],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    const [moved] = songs.splice(from, 1);
    songs.splice(to, 0, moved);

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          `↔️  Moved **${moved.name}** from position **#${from}** → **#${to}**!`
        ),
      ],
    });
  },
};
