const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require('discord.js');
const { createErrorEmbed, createSuccessEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('🔍 Search for a song and select from results')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Search query').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { member, channel } = interaction;
    const query = interaction.options.getString('query');

    if (!member.voice.channel) {
      return interaction.editReply({
        embeds: [createErrorEmbed('You need to be in a voice channel!')],
      });
    }

    try {
      const results = await interaction.client.distube.search(query, { limit: 10 });

      if (!results || results.length === 0) {
        return interaction.editReply({ embeds: [createErrorEmbed('No results found!')] });
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setAuthor({ name: `🔍  Results for "${query.slice(0, 50)}"` })
        .setDescription(
          results
            .map(
              (s, i) =>
                `\`${i + 1}.\` **[${s.name}](${s.url})**\n` +
                `      👤 ${s.uploader?.name || 'Unknown'} • ⏱️ \`${s.formattedDuration || '?'}\``
            )
            .join('\n\n')
        )
        .setFooter({ text: 'Select a song below • Expires in 30s' })
        .setTimestamp();

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('search_select')
        .setPlaceholder('🎵 Choose a song to play...')
        .addOptions(
          results.slice(0, 10).map((s, i) => ({
            label: (s.name || 'Unknown').slice(0, 100),
            description: `${s.uploader?.name || 'Unknown'} • ${s.formattedDuration || '?'}`.slice(0, 100),
            value: s.url,
            emoji: '🎵',
          }))
        );

      const row      = new ActionRowBuilder().addComponents(selectMenu);
      const response = await interaction.editReply({ embeds: [embed], components: [row] });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.customId === 'search_select' && i.user.id === interaction.user.id,
        time: 30_000,
        max: 1,
      });

      collector.on('collect', async (i) => {
        await i.deferUpdate();
        const url = i.values[0];

        try {
          await interaction.client.distube.play(member.voice.channel, url, {
            member,
            textChannel: channel,
          });
          await interaction.editReply({
            embeds: [createSuccessEmbed('✅  Added to queue!')],
            components: [],
          });
        } catch (err) {
          await interaction.editReply({
            embeds: [createErrorEmbed(err.message)],
            components: [],
          });
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ components: [] }).catch(() => {});
        }
      });
    } catch (err) {
      console.error('[/search]', err.message);
      return interaction.editReply({
        embeds: [createErrorEmbed(`Search failed: ${err.message}`)],
      });
    }
  },
};
