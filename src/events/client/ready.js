const { ActivityType } = require('discord.js');

module.exports = {
  once: true,

  async execute(client) {
    console.log('━'.repeat(40));
    console.log(`🎵  ${client.user.tag} is now online!`);
    console.log(`📡  Serving ${client.guilds.cache.size} server(s)`);
    console.log(`🤖  Client ID: ${client.user.id}`);
    console.log('━'.repeat(40));
    console.log('');

    // Rotate activity status every 15 seconds
    const statuses = [
      { name: '/play — Start Listening',        type: ActivityType.Listening },
      { name: '/help — View All Commands',       type: ActivityType.Playing },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: 'Spotify & YouTube',               type: ActivityType.Listening },
    ];

    let idx = 0;
    const setStatus = () => {
      client.user.setActivity(statuses[idx % statuses.length]);
      idx++;
    };

    setStatus();
    setInterval(setStatus, 15_000);
  },
};
