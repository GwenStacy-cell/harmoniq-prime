/**
 * DisTube `disconnect` event — fired when the bot disconnects from the voice channel.
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

    // In 24/7 mode: attempt to rejoin the voice channel
    if (guildId && client.stay247?.has(guildId)) {
      const voiceChannel = queue.voice;
      if (voiceChannel) {
        setTimeout(() => {
          client.distube.voices.join(voiceChannel).catch(() => {});
        }, 2_000);
      }
    }
  },
};
