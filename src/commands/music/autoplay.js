const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('🎲 Toggle autoplay (plays related songs when queue ends)'),

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

    const newState = interaction.client.distube.toggleAutoplay(guild);

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          `🎲  Autoplay **${newState ? 'enabled' : 'disabled'}**!\n${
            newState
              ? 'Related songs will play when the queue ends.'
              : 'Bot will stop when the queue ends.'
          }`
        ),
      ],
    });
  },
};
