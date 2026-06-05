const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed, COLORS } = require('../../utils/embeds');
const { FILTERS } = require('../../utils/filters');

// Build choices array (Discord allows max 25 choices)
const filterChoices = Object.entries(FILTERS)
  .slice(0, 25)
  .map(([key, val]) => ({ name: val.name, value: key }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('🎛️ Manage audio filters')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add an audio filter')
        .addStringOption((opt) =>
          opt.setName('name').setDescription('Filter to apply').setRequired(true).addChoices(...filterChoices)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove an audio filter')
        .addStringOption((opt) =>
          opt.setName('name').setDescription('Filter to remove').setRequired(true).addChoices(...filterChoices)
        )
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('Show all active filters'))
    .addSubcommand((sub) => sub.setName('clear').setDescription('Clear all active filters')),

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

    const sub = interaction.options.getSubcommand();

    // ── List active filters ──────────────────────────────────────────────────
    if (sub === 'list') {
      const active = [];
      for (const key of Object.keys(FILTERS)) {
        if (queue.filters.has(key)) active.push(FILTERS[key].name);
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle('🎛️  Active Audio Filters')
        .setDescription(active.length > 0 ? active.map((f) => `• ${f}`).join('\n') : '*No filters active*')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ── Clear all filters ────────────────────────────────────────────────────
    if (sub === 'clear') {
      queue.filters.clear();
      return interaction.reply({
        embeds: [createSuccessEmbed('🎛️  Cleared all audio filters!')],
      });
    }

    const filterName = interaction.options.getString('name');
    const filterMeta = FILTERS[filterName];

    // ── Add filter ───────────────────────────────────────────────────────────
    if (sub === 'add') {
      if (queue.filters.has(filterName)) {
        return interaction.reply({
          embeds: [createErrorEmbed(`Filter **${filterMeta?.name}** is already active!`)],
          ephemeral: true,
        });
      }
      queue.filters.add(filterName);
      return interaction.reply({
        embeds: [createSuccessEmbed(`🎛️  Added filter: **${filterMeta?.name || filterName}**`)],
      });
    }

    // ── Remove filter ────────────────────────────────────────────────────────
    if (sub === 'remove') {
      if (!queue.filters.has(filterName)) {
        return interaction.reply({
          embeds: [createErrorEmbed(`Filter **${filterMeta?.name}** is not active!`)],
          ephemeral: true,
        });
      }
      queue.filters.remove(filterName);
      return interaction.reply({
        embeds: [createSuccessEmbed(`🎛️  Removed filter: **${filterMeta?.name || filterName}**`)],
      });
    }
  },
};
