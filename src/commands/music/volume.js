const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('🔊 Set the music volume')
    .addIntegerOption((opt) =>
      opt
        .setName('level')
        .setDescription('Volume level (1–100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
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

    const volume = interaction.options.getInteger('level');
    interaction.client.distube.setVolume(guild, volume);

    const filled = Math.round(volume / 10);
    const bar    = '█'.repeat(filled) + '░'.repeat(10 - filled);

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          `🔊  Volume set to **${volume}%**\n\`[${bar}]\``
        ),
      ],
    });
  },
};
