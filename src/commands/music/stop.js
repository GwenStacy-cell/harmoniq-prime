const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('⏹️ Stop the music and clear the queue'),

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

    // Delete now-playing message
    const msg = interaction.client.nowPlayingMessages?.get(guild.id);
    if (msg) {
      await msg.delete().catch(() => {});
      interaction.client.nowPlayingMessages.delete(guild.id);
    }

    interaction.client.distube.stop(guild);
    await interaction.reply({
      embeds: [createSuccessEmbed('⏹️  Stopped the music and cleared the queue!')],
    });
  },
};
