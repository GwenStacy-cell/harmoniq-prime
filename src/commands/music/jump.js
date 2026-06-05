const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('🦘 Jump to a specific position in the queue')
    .addIntegerOption((opt) =>
      opt
        .setName('position')
        .setDescription('Queue position to jump to (1 = next song)')
        .setRequired(true)
        .setMinValue(1)
    ),

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

    const position = interaction.options.getInteger('position');

    if (position >= queue.songs.length) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            `Invalid position! Queue has **${queue.songs.length - 1}** upcoming song(s).`
          ),
        ],
        ephemeral: true,
      });
    }

    const target = queue.songs[position];

    try {
      await interaction.client.distube.jump(guild, position);
      await interaction.reply({
        embeds: [createSuccessEmbed(`🦘  Jumped to **${target.name}**!`)],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [createErrorEmbed(err.message)],
        ephemeral: true,
      });
    }
  },
};
