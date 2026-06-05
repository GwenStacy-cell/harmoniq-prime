const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createSuccessEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('247')
    .setDescription('📻 Toggle 24/7 mode (bot stays in voice channel indefinitely)'),

  async execute(interaction) {
    const { guild, member } = interaction;

    if (!member.voice.channel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You need to be in a voice channel!')],
        ephemeral: true,
      });
    }

    const is247 = interaction.client.stay247.has(guild.id);

    if (is247) {
      interaction.client.stay247.delete(guild.id);
      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            '📻  24/7 mode **disabled**!\nBot will leave when the queue is empty.'
          ),
        ],
      });
    } else {
      interaction.client.stay247.add(guild.id);
      await interaction.reply({
        embeds: [
          createSuccessEmbed(
            '📻  24/7 mode **enabled**!\nBot will stay in the voice channel indefinitely.'
          ),
        ],
      });
    }
  },
};
