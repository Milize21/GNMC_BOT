// setup.js - Configuration Wizard for Inventory Discord Bot
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m%s\x1b[0m', '||            INVENTORY BOT SETUP WIZARD            ||');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');

// Get the current config
let config = {};
try {
  config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch (error) {
  console.error('Error loading config file:', error);
  console.log('Creating a new config file...');
  config = {
    token: "",
    applicationId: "1387804137424424980",
    publicKey: "0a602bad81e16992de6ef471a5a114257e65e153b019c06089c47573bcfaaf4d",
    deepseekApiKey: "sk-85d2f13a9fbe4e059738874148b09245",
    guildId: "",
    adminRoles: [],
    inventoryChannelId: "",
    logChannelId: ""
  };
}

// Helper function for asking questions
function question(query, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    rl.question(`\x1b[33m${query}${defaultText}: \x1b[0m`, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Run the setup wizard
async function setupWizard() {
  console.log('\x1b[32m%s\x1b[0m', '\nThis wizard will help you set up your inventory bot.\n');
  
  // Bot Token
  console.log('\x1b[35m%s\x1b[0m', '\n--- DISCORD BOT TOKEN ---');
  console.log('You can find your bot token in the Discord Developer Portal:');
  console.log('https://discord.com/developers/applications\n');
  
  config.token = await question('Enter your Discord bot token', config.token);
  
  // Guild ID
  console.log('\x1b[35m%s\x1b[0m', '\n--- DISCORD SERVER (GUILD) ID ---');
  console.log('To get your server ID, enable Developer Mode in Discord settings,');
  console.log('then right-click on your server icon and click "Copy ID"\n');
  
  config.guildId = await question('Enter your Discord server (guild) ID', config.guildId);
  
  // Admin Roles
  console.log('\x1b[35m%s\x1b[0m', '\n--- ADMIN ROLES ---');
  console.log('These roles will have access to admin commands');
  console.log('To get a role ID, enable Developer Mode, right-click a role and click "Copy ID"\n');
  
  const currentRoles = config.adminRoles.join(', ');
  const adminRoles = await question(`Enter admin role IDs (comma separated)`, currentRoles);
  config.adminRoles = adminRoles.split(',').map(role => role.trim()).filter(role => role);
  
  // Channel IDs
  console.log('\x1b[35m%s\x1b[0m', '\n--- CHANNEL IDs ---');
  console.log('To get a channel ID, right-click on a channel and click "Copy ID"\n');
  
  config.inventoryChannelId = await question('Enter inventory channel ID (for main inventory display)', config.inventoryChannelId);
  config.logChannelId = await question('Enter log channel ID (for logging inventory actions)', config.logChannelId);
  
  // Save config
  try {
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '\n✅ Configuration saved successfully!\n');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '\n❌ Error saving configuration:', error);
  }
  
  // Create data directory and default inventory file if it doesn't exist
  try {
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
      console.log('\x1b[32m%s\x1b[0m', '✅ Created data directory');
    }
    
    if (!fs.existsSync('./data/inventory.json')) {
      const defaultInventory = {
        categories: {},
        items: {}
      };
      fs.writeFileSync('./data/inventory.json', JSON.stringify(defaultInventory, null, 2));
      console.log('\x1b[32m%s\x1b[0m', '✅ Created default inventory data file');
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error setting up data files:', error);
  }
  
  console.log('\x1b[36m%s\x1b[0m', '\n=======================================================');
  console.log('\x1b[36m%s\x1b[0m', '||               SETUP COMPLETE!                    ||');
  console.log('\x1b[36m%s\x1b[0m', '=======================================================');
  console.log('\x1b[32m%s\x1b[0m', '\nTo start the bot, run: node index.js');
  console.log('\x1b[33m%s\x1b[0m', '\nMake sure to:');
  console.log('1. Invite the bot to your server with proper permissions');
  console.log('2. Ensure the bot has access to all the channels specified');
  console.log('3. Set up slash commands by running the bot once\n');
  
  rl.close();
}

setupWizard();
