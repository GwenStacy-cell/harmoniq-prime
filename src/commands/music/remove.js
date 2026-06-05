const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('🗑️ Remove a song from the queue')
    .addIntegerOption((opt) =>
      opt
        .setName('position')
        .setDescription('Queue position to remove (1 = next song)')
        .setRequired(true)
        .setMinValue(1)
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

    const position = interaction.options.getInteger('position');

    if (position >= queue.songs.length) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            `Invalid position! Queue has **${queue.songs.length - 1}** upcoming song(s).`
          ),
        ],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    const removed = queue.songs[position];
    queue.songs.splice(position, 1);

    await interaction.reply({
      embeds: [createSuccessEmbed(`🗑️  Removed **${removed.name}** from the queue!`)],
    });
  },
};
