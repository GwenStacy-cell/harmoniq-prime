const { readdirSync } = require('fs');
const { join } = require('path');

/**
 * Recursively load all slash commands from src/commands/
 * @param {import('discord.js').Client} client
 */
function loadCommands(client) {
  const commandFolders = readdirSync(join(__dirname, '../commands'));

  for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, '../commands', folder)).filter((f) =>
      f.endsWith('.js')
    );

    for (const file of commandFiles) {
      const command = require(join(__dirname, '../commands', folder, file));

      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`  ✅ /${command.data.name}`);
      } else {
        console.warn(`  ⚠️  Skipped: ${file} (missing data or execute)`);
      }
    }
  }

  console.log(`\n📦 Loaded ${client.commands.size} commands total\n`);
}

module.exports = { loadCommands };
