const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎵 Play a song or playlist from YouTube or Spotify')
    .addStringOption((opt) =>
      opt
        .setName('query')
        .setDescription('Song name, YouTube URL, or Spotify URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { member, channel } = interaction;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed('You need to be in a voice channel to play music!')],
      });
    }

    const query = interaction.options.getString('query');

    try {
      await interaction.client.distube.play(voiceChannel, query, {
        member,
        textChannel: channel,
      });
      // playSong / addSong / addList events handle the embed responses
      await interaction.deleteReply().catch(() => {});
    } catch (error) {
      console.error('[/play]', error.message);
      return interaction.editReply({
        embeds: [createErrorEmbed(`Playback failed: ${error.message}`)],
      });
    }
  },
};
