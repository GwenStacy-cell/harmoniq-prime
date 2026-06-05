const { createNowPlayingEmbed, createMusicButtons } = require('../../utils/embeds');

/**
 * DisTube `playSong` event — fired when a new song starts playing.
 * Sends a now-playing embed with interactive buttons and stores the message.
 */
module.exports = {
  async execute(client, queue, song) {
    // Delete the previous now-playing message if it exists
    const guildId = queue.textChannel?.guild?.id;
    if (guildId) {
      const prev = client.nowPlayingMessages?.get(guildId);
      if (prev) {
        await prev.delete().catch(() => {});
        client.nowPlayingMessages.delete(guildId);
      }
    }

    try {
      const embed   = createNowPlayingEmbed(queue, song);
      const buttons = createMusicButtons(queue);

      const msg = await queue.textChannel?.send({
        embeds:     [embed],
        components: buttons,
      });

      if (msg && guildId) {
        client.nowPlayingMessages.set(guildId, msg);
      }
    } catch (error) {
      console.error('[playSong] Error sending now-playing embed:', error.message);
    }
  },
};
