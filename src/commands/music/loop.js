const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('🔁 Set the loop mode')
    .addStringOption((opt) =>
      opt
        .setName('mode')
        .setDescription('Choose loop mode')
        .setRequired(true)
        .addChoices(
          { name: '🔇 Off',     value: '0' },
          { name: '🔂 Song',    value: '1' },
          { name: '🔁 Queue',   value: '2' },
        )
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

    const mode  = parseInt(interaction.options.getString('mode'));
    const names = ['🔇 Off', '🔂 Song', '🔁 Queue'];

    interaction.client.distube.setRepeatMode(guild, mode);
    await interaction.reply({
      embeds: [createSuccessEmbed(`Loop mode set to **${names[mode]}**`)],
    });
  },
};
