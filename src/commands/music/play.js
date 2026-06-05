const { SlashCommandBuilder, MessageFlags } = require('discord.js');
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
    // Guard: if already acknowledged (e.g. two bot instances), bail silently
    if (interaction.deferred || interaction.replied) return;
    try {
      await interaction.deferReply();
    } catch (err) {
      if (err.code === 40060 || err.code === 10062) return; // Already ack'd — ignore
      throw err;
    }

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
      const reply = { embeds: [createErrorEmbed(`Playback failed: ${error.message}`)] };
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply(reply).catch(() => {});
      }
      return interaction.reply({ ...reply, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  },
};
