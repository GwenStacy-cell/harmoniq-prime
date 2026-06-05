const { createErrorEmbed } = require('../../utils/embeds');

/**
 * DisTube v5 `error` event.
 * Signature: (error: Error, queue: Queue, song?: Song)
 */
module.exports = {
  async execute(client, error, queue, song) {
    console.error('[DisTube ERROR]', error?.message || error);

    try {
      const channel = queue?.textChannel;
      if (channel?.send) {
        await channel.send({
          embeds: [createErrorEmbed(`Music Error: ${error?.message || 'Unknown error occurred.'}`)]
        });
      }
    } catch {}
  },
};
