const { readdirSync } = require('fs');
const { join } = require('path');

/**
 * Load all Discord client events from src/events/client/
 * @param {import('discord.js').Client} client
 */
function loadEvents(client) {
  const eventFiles = readdirSync(join(__dirname, '../events/client')).filter((f) =>
    f.endsWith('.js')
  );

  for (const file of eventFiles) {
    const event    = require(join(__dirname, '../events/client', file));
    const eventName = file.replace('.js', '');
    // discord.js v14 uses 'clientReady' for the once-ready event (avoids deprecation warning)
    const name = eventName === 'ready' ? 'clientReady' : eventName;
    const handler  = (...args) => event.execute(client, ...args);

    if (event.once) {
      client.once(name, handler);
    } else {
      client.on(name, handler);
    }

    console.log(`  ✅ Event: ${name}`);
  }
}

module.exports = { loadEvents };
