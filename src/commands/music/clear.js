const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 Clear the queue (keeps the current song playing)'),

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

    if (queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [createErrorEmbed('No queued songs to clear (only the current song is playing).')],
        ephemeral: true,
      });
    }

    const count = queue.songs.length - 1;
    queue.songs.splice(1); // keep index 0 (current song)

    await interaction.reply({
      embeds: [createSuccessEmbed(`🧹  Cleared **${count}** song(s) from the queue!`)],
    });
  },
};
