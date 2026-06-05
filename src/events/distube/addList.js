const { createAddedPlaylistEmbed } = require('../../utils/embeds');

/**
 * DisTube `addList` event — fired when a playlist is added to the queue.
 */
module.exports = {
  async execute(client, queue, playlist) {
    try {
      await queue.textChannel?.send({
        embeds: [createAddedPlaylistEmbed(playlist, queue)],
      });
    } catch (error) {
      console.error('[addList] Error:', error.message);
    }
  },
};
