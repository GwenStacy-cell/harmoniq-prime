const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('🔀 Shuffle the queue'),

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

    if (queue.songs.length < 3) {
      return interaction.reply({
        embeds: [createErrorEmbed('Not enough songs in the queue to shuffle! (need at least 2 in queue)')],
        ephemeral: true,
      });
    }

    interaction.client.distube.shuffle(guild);
    await interaction.reply({
      embeds: [createSuccessEmbed(`🔀  Shuffled **${queue.songs.length - 1}** song(s) in the queue!`)],
    });
  },
};
