const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../../utils/embeds');

/**
 * DisTube `finish` event — fired when the queue has no more songs.
 */
module.exports = {
  async execute(client, queue) {
    const guildId = queue.textChannel?.guild?.id;

    // Clean up now-playing message
    if (guildId) {
      const msg = client.nowPlayingMessages?.get(guildId);
      if (msg) {
        await msg.delete().catch(() => {});
        client.nowPlayingMessages.delete(guildId);
      }
    }

    // Don't send a message if 24/7 mode is active
    if (guildId && client.stay247?.has(guildId)) return;

    try {
      await queue.textChannel?.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.primary)
            .setDescription(
              '🎵  The queue has ended! Thanks for listening.\nUse `/play` to add more songs!'
            )
            .setTimestamp(),
        ],
      });
    } catch {}
  },
};
