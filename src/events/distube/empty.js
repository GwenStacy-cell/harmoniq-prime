const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../../utils/embeds');

/**
 * DisTube `empty` event — fired when the voice channel becomes empty.
 * If 24/7 mode is disabled the bot leaves after 30 seconds.
 */
module.exports = {
  async execute(client, queue) {
    const guildId = queue.textChannel?.guild?.id;

    // 24/7 mode: stay forever
    if (guildId && client.stay247?.has(guildId)) return;

    try {
      await queue.textChannel?.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.warning)
            .setDescription(
              '👥  The voice channel is empty! Leaving in **30 seconds** unless someone joins...'
            ),
        ],
      });
    } catch {}

    // Leave after 30 s if still empty
    setTimeout(async () => {
      if (guildId && client.stay247?.has(guildId)) return;

      const currentQueue = client.distube.getQueue(guildId || '');
      if (currentQueue) {
        try {
          client.distube.voices.get(guildId)?.leave();
        } catch {}
      }
    }, 30_000);
  },
};
