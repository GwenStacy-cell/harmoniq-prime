const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createNowPlayingEmbed, createMusicButtons } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('🎵 Show the currently playing song'),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild);

    if (!queue || !queue.songs.length) {
      return interaction.reply({
        embeds: [createErrorEmbed('Nothing is playing right now!')],
        flags: require('discord.js').MessageFlags.Ephemeral,
      });
    }

    const song    = queue.songs[0];
    const embed   = createNowPlayingEmbed(queue, song);
    const buttons = createMusicButtons(queue);

    await interaction.reply({ embeds: [embed], components: buttons });
  },
};
