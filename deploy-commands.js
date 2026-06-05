// ════════════════════════════════════════════════════════════════════════════
//  🚀  deploy-commands.js
//  Run once with: node deploy-commands.js
//  Registers all slash commands globally with the Discord API.
// ════════════════════════════════════════════════════════════════════════════

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { readdirSync }  = require('fs');
const { join }         = require('path');

const token    = process.env.DISCORD_TOKEN;
const clientId = Buffer.from(token.split('.')[0], 'base64').toString();

console.log(`\n🤖  Client ID: ${clientId}`);

// ─── Collect all command data ─────────────────────────────────────────────────
const commands = [];
const folders  = readdirSync(join(__dirname, 'src/commands'));

for (const folder of folders) {
  const files = readdirSync(join(__dirname, 'src/commands', folder)).filter((f) =>
    f.endsWith('.js')
  );

  for (const file of files) {
    const cmd = require(join(__dirname, 'src/commands', folder, file));
    if (cmd.data) {
      commands.push(cmd.data.toJSON());
      console.log(`  📦  /${cmd.data.name}`);
    }
  }
}

// ─── Deploy via REST ─────────────────────────────────────────────────────────
const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`\n🚀  Deploying ${commands.length} command(s) globally...\n`);

    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(`✅  Successfully deployed ${data.length} command(s)!`);
    console.log('⏳  Note: Global commands may take up to 1 hour to appear in all servers.\n');
  } catch (err) {
    console.error('❌  Deploy failed:', err);
    process.exit(1);
  }
})();
