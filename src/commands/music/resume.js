const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('▶️ Resume the paused song'),

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

    if (!queue.paused) {
      return interaction.reply({
        embeds: [createErrorEmbed('Music is already playing! Use `/pause` to pause.')],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    interaction.client.distube.resume(guild);
    await interaction.reply({ embeds: [createSuccessEmbed('▶️  Resumed the music!')] });
  },
};
