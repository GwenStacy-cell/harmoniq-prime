const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('back')
    .setDescription('⏮️ Go back to the previous song'),

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

    try {
      await interaction.client.distube.previous(guild);
      await interaction.reply({
        embeds: [createSuccessEmbed('⏮️  Going back to the previous song!')],
      });
    } catch {
      await interaction.reply({
        embeds: [createErrorEmbed('No previous song in history!')],
        ephemeral: true,
      });
    }
  },
};
