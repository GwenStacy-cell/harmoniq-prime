const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

/**
 * Build a row of pagination buttons.
 * @param {number} currentPage - 0-indexed current page
 * @param {number} totalPages  - Total number of pages
 * @param {string} prefix      - Custom ID prefix for buttons
 */
function createPaginationButtons(currentPage, totalPages, prefix = 'page') {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${prefix}_first`)
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${prefix}_prev`)
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${prefix}_info`)
      .setLabel(`${currentPage + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${prefix}_next`)
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`${prefix}_last`)
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages - 1),
  );
}

/**
 * Handle a paginated interaction.
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {Function} buildPage  - Async function(pageIndex) => EmbedBuilder
 * @param {number}   totalPages
 * @param {string}   prefix    - Button ID prefix
 */
async function handlePagination(interaction, buildPage, totalPages, prefix = 'page') {
  let currentPage = 0;

  const buildMessage = async (page) => ({
    embeds: [await buildPage(page)],
    components: totalPages > 1 ? [createPaginationButtons(page, totalPages, prefix)] : [],
  });

  const response = await interaction.editReply(await buildMessage(0));

  if (totalPages <= 1) return;

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith(prefix + '_'),
    time: 120_000, // 2 min
  });

  collector.on('collect', async (i) => {
    const action = i.customId.split('_').pop();

    if (action === 'first') currentPage = 0;
    else if (action === 'prev')  currentPage = Math.max(0, currentPage - 1);
    else if (action === 'next')  currentPage = Math.min(totalPages - 1, currentPage + 1);
    else if (action === 'last')  currentPage = totalPages - 1;

    await i.update(await buildMessage(currentPage));
  });

  collector.on('end', async () => {
    // Disable all buttons on timeout
    const msg = await buildMessage(currentPage);
    if (msg.components.length > 0) {
      msg.components[0].components.forEach((btn) => {
        // Recreate disabled versions (ButtonBuilder instances)
      });
    }
    await interaction.editReply({ components: [] }).catch(() => {});
  });
}

module.exports = { createPaginationButtons, handlePagination };
