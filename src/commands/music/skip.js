const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭️ Skip the current song'),

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

    const skipped = queue.songs[0]?.name || 'the current song';

    try {
      await interaction.client.distube.skip(guild);
      await interaction.reply({
        embeds: [createSuccessEmbed(`⏭️  Skipped **${skipped}**!`)],
      });
    } catch (error) {
      await interaction.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
    }
  },
};
