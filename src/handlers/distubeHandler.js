const { readdirSync } = require('fs');
const { join } = require('path');

/**
 * Load all DisTube events from src/events/distube/
 * @param {import('discord.js').Client} client
 */
function loadDistubeEvents(client) {
  const eventFiles = readdirSync(join(__dirname, '../events/distube')).filter((f) =>
    f.endsWith('.js')
  );

  for (const file of eventFiles) {
    const event   = require(join(__dirname, '../events/distube', file));
    const name    = file.replace('.js', '');

    client.distube.on(name, (...args) => event.execute(client, ...args));
    console.log(`  ✅ DisTube Event: ${name}`);
  }
}

module.exports = { loadDistubeEvents };
