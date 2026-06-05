const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createQueueEmbed } = require('../../utils/embeds');
const { handlePagination } = require('../../utils/pagination');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📋 Show the current music queue'),

  async execute(interaction) {
    await interaction.deferReply();

    const queue = interaction.client.distube.getQueue(interaction.guild);

    if (!queue || !queue.songs.length) {
      return interaction.editReply({
        embeds: [createErrorEmbed('The queue is empty!')],
      });
    }

    const ITEMS_PER_PAGE = 10;
    const upcoming       = queue.songs.slice(1);
    const totalPages     = Math.max(1, Math.ceil(upcoming.length / ITEMS_PER_PAGE) + (upcoming.length === 0 ? 0 : 0) + 1);

    await handlePagination(
      interaction,
      (page) => createQueueEmbed(queue, page),
      totalPages,
      'queue'
    );
  },
};
