const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../../utils/embeds');

const COMMANDS = [
  {
    category: '🎵 Playback',
    cmds: [
      ['/play',       'Play from YouTube, Spotify track/album/playlist'],
      ['/pause',      'Pause the current song'],
      ['/resume',     'Resume a paused song'],
      ['/skip',       'Skip to the next song'],
      ['/back',       'Go back to the previous song'],
      ['/stop',       'Stop music and clear the queue'],
      ['/seek',       'Seek to a timestamp in seconds'],
      ['/nowplaying', 'Show the now-playing card with controls'],
    ],
  },
  {
    category: '📋 Queue',
    cmds: [
      ['/queue',   'View the current queue (paginated)'],
      ['/shuffle', 'Shuffle the upcoming songs'],
      ['/loop',    'Set loop mode: off / song / queue'],
      ['/remove',  'Remove a song by its queue position'],
      ['/move',    'Move a song to a different position'],
      ['/clear',   'Clear all queued songs (keeps current)'],
      ['/jump',    'Jump directly to a queue position'],
    ],
  },
  {
    category: '🎛️ Settings',
    cmds: [
      ['/volume',   'Set the volume (1–100)'],
      ['/filter',   'Add/remove/list/clear audio filters'],
      ['/autoplay', 'Toggle autoplay when queue ends'],
      ['/247',      'Toggle 24/7 mode (stay in channel)'],
    ],
  },
  {
    category: '🔍 Discovery',
    cmds: [
      ['/search', 'Search and select from a results list'],
      ['/lyrics', 'Get lyrics for any song via Genius'],
    ],
  },
  {
    category: '🛠️ Utility',
    cmds: [
      ['/ping', 'Check the bot\'s latency'],
      ['/help', 'Show this help message'],
    ],
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📖 Show all available commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setAuthor({
        name:    `${interaction.client.user.username} — Command Reference`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle('🎵  Harmony Music Bot')
      .setDescription(
        '> A powerful music bot supporting **YouTube** & **Spotify**.\n' +
        '> Join a voice channel, then use `/play` to start!\n\n' +
        '> 🎹 **Button Controls** appear on the Now Playing card for instant access.'
      )
      .addFields(
        COMMANDS.map((group) => ({
          name:   group.category,
          value:  group.cmds.map(([cmd, desc]) => `\`${cmd}\` — ${desc}`).join('\n'),
          inline: false,
        }))
      )
      .addFields({
        name:   '🎛️ Audio Filters Available',
        value:
          '`bassboost` `8d` `nightcore` `vaporwave` `karaoke` `echo` ' +
          '`flanger` `tremolo` `vibrato` `reverse` `treble` `normalizer` ' +
          '`surrounding` `pulsator` `phaser` `daycore` `lofi` `earrape`',
        inline: false,
      })
      .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: 'Supports YouTube & Spotify • Made with ❤️' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
