const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Check the bot\'s latency'),

  async execute(interaction) {
    const sent     = await interaction.deferReply({ fetchReply: true });
    const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency  = interaction.client.ws.ping;

    const color =
      apiLatency < 100 ? COLORS.success
      : apiLatency < 250 ? COLORS.warning
      : COLORS.error;

    const status =
      apiLatency < 100 ? '🟢 Excellent'
      : apiLatency < 250 ? '🟡 Good'
      : '🔴 Poor';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '🏓  Pong!' })
      .addFields([
        { name: '📡 API Latency',       value: `\`${apiLatency}ms\``, inline: true },
        { name: '💓 WebSocket',         value: `\`${wsLatency}ms\``,  inline: true },
        { name: '📊 Connection Status', value: status,                 inline: true },
      ])
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
