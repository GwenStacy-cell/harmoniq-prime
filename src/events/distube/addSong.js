const { createAddedToQueueEmbed } = require('../../utils/embeds');

/**
 * DisTube `addSong` event — fired when a single song is added to an existing queue.
 */
module.exports = {
  async execute(client, queue, song) {
    try {
      await queue.textChannel?.send({
        embeds: [createAddedToQueueEmbed(song, queue)],
      });
    } catch (error) {
      console.error('[addSong] Error:', error.message);
    }
  },
};
