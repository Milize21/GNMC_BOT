const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// Initialize client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize collections
client.commands = new Collection();

// Load custom commands if they exist
function loadCustomCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    console.log(`Loaded custom command: ${command.data.name}`);
                } else {
                    console.log(`[WARNING] Command at ${filePath} is missing required properties`);
                }
            } catch (error) {
                console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
            }
        }
    }
}

// Data storage
let inventoryData = {
    categories: {},
    items: {}
};

// Load inventory data
function loadInventoryData() {
    try {
        if (fs.existsSync('./data/inventory.json')) {
            const data = fs.readFileSync('./data/inventory.json', 'utf8');
            inventoryData = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading inventory data:', error);
    }
}

// Save inventory data
function saveInventoryData() {
    try {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        fs.writeFileSync('./data/inventory.json', JSON.stringify(inventoryData, null, 2));
    } catch (error) {
        console.error('Error saving inventory data:', error);
    }
}

// Check if user is admin
function isAdmin(member) {
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    return config.adminRoles.some(roleId => member.roles.cache.has(roleId));
}

// Create slash commands
const commands = [
    // Admin commands
    new SlashCommandBuilder()
        .setName('inventory-admin')
        .setDescription('Admin inventory management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-category')
                .setDescription('Add a new category')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Category name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Category description')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-category')
                .setDescription('Remove a category')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Category name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-item')
                .setDescription('Add a new item')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Item name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Category name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Item description')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('initial-quantity')
                        .setDescription('Initial quantity')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-item')
                .setDescription('Remove an item')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Item name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit-item')
                .setDescription('Edit an item')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Item name')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // User commands
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View and manage inventory')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View inventory'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-quantity')
                .setDescription('Add quantity to an item')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Item name')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('quantity')
                        .setDescription('Quantity to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-quantity')
                .setDescription('Remove quantity from an item')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Item name')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('quantity')
                        .setDescription('Quantity to remove')
                        .setRequired(true)))
];

// Register slash commands
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Load inventory data
    loadInventoryData();
    
    // Load custom commands
    loadCustomCommands();
    
    try {
        console.log('Started refreshing application (/) commands.');
        
        const guild = client.guilds.cache.get(config.guildId);
        if (guild) {
            // Get all commands (built-in + custom)
            const allCommands = [...commands];
            
            // Add custom commands from the collection
            client.commands.forEach(cmd => {
                // Only add if not already in the commands array
                if (!allCommands.some(c => c.name === cmd.data.name)) {
                    allCommands.push(cmd.data);
                }
            });
            
            await guild.commands.set(allCommands);
            console.log('Successfully reloaded application (/) commands for guild.');
        } else {
            await client.application.commands.set(commands);
            console.log('Successfully reloaded global application (/) commands.');
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName, options } = interaction;
        
        // Check for custom commands
        if (client.commands.has(commandName)) {
            try {
                await client.commands.get(commandName).execute(interaction);
                return;
            } catch (error) {
                console.error(`Error executing custom command ${commandName}:`, error);
                await interaction.reply({
                    content: 'There was an error executing this command!',
                    ephemeral: true
                });
                return;
            }
        }
        
        // Handle built-in commands
        if (commandName === 'inventory-admin') {
            // Check if user is admin
            if (!isAdmin(interaction.member)) {
                return await interaction.reply({
                    content: '❌ You need administrator permissions to use this command.',
                    ephemeral: true
                });
            }
            
            const subcommand = options.getSubcommand();
            
            switch (subcommand) {
                case 'add-category':
                    await handleAddCategory(interaction);
                    break;
                case 'remove-category':
                    await handleRemoveCategory(interaction);
                    break;
                case 'add-item':
                    await handleAddItem(interaction);
                    break;
                case 'remove-item':
                    await handleRemoveItem(interaction);
                    break;
                case 'edit-item':
                    await handleEditItem(interaction);
                    break;
            }
        } else if (commandName === 'inventory') {
            const subcommand = options.getSubcommand();
            
            switch (subcommand) {
                case 'view':
                    await handleViewInventory(interaction);
                    break;
                case 'add-quantity':
                    await handleAddQuantity(interaction);
                    break;
                case 'remove-quantity':
                    await handleRemoveQuantity(interaction);
                    break;
            }
        }
    } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
    }
});

// Command handlers
async function handleAddCategory(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    const description = interaction.options.getString('description') || '';
    
    if (inventoryData.categories[name]) {
        return await interaction.reply({
            content: `❌ Category "${name}" already exists.`,
            ephemeral: true
        });
    }
    
    inventoryData.categories[name] = {
        name: name,
        displayName: interaction.options.getString('name'),
        description: description,
        createdAt: new Date().toISOString(),
        createdBy: interaction.user.id
    };
    
    saveInventoryData();
    
    await interaction.reply({
        content: `✅ Category "${name}" has been created successfully!`,
        ephemeral: true
    });
    
    // Log the action
    await logAction(interaction, `Added category: ${name}`);
}

async function handleRemoveCategory(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    
    if (!inventoryData.categories[name]) {
        return await interaction.reply({
            content: `❌ Category "${name}" does not exist.`,
            ephemeral: true
        });
    }
    
    // Check if category has items
    const categoryItems = Object.values(inventoryData.items).filter(item => item.category === name);
    if (categoryItems.length > 0) {
        return await interaction.reply({
            content: `❌ Cannot remove category "${name}" because it contains ${categoryItems.length} items. Remove all items first.`,
            ephemeral: true
        });
    }
    
    delete inventoryData.categories[name];
    saveInventoryData();
    
    await interaction.reply({
        content: `✅ Category "${name}" has been removed successfully!`,
        ephemeral: true
    });
    
    // Log the action
    await logAction(interaction, `Removed category: ${name}`);
}

async function handleAddItem(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    const category = interaction.options.getString('category').toLowerCase();
    const description = interaction.options.getString('description') || '';
    const initialQuantity = interaction.options.getInteger('initial-quantity') || 0;
    
    if (!inventoryData.categories[category]) {
        return await interaction.reply({
            content: `❌ Category "${category}" does not exist. Create it first.`,
            ephemeral: true
        });
    }
    
    if (inventoryData.items[name]) {
        return await interaction.reply({
            content: `❌ Item "${name}" already exists.`,
            ephemeral: true
        });
    }
    
    inventoryData.items[name] = {
        name: name,
        displayName: interaction.options.getString('name'),
        category: category,
        description: description,
        quantity: initialQuantity,
        createdAt: new Date().toISOString(),
        createdBy: interaction.user.id,
        lastModified: new Date().toISOString(),
        lastModifiedBy: interaction.user.id
    };
    
    saveInventoryData();
    
    await interaction.reply({
        content: `✅ Item "${name}" has been added to category "${category}" with quantity ${initialQuantity}!`,
        ephemeral: true
    });
    
    // Log the action
    await logAction(interaction, `Added item: ${name} (Category: ${category}, Quantity: ${initialQuantity})`);
}

async function handleRemoveItem(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    
    if (!inventoryData.items[name]) {
        return await interaction.reply({
            content: `❌ Item "${name}" does not exist.`,
            ephemeral: true
        });
    }
    
    const item = inventoryData.items[name];
    delete inventoryData.items[name];
    saveInventoryData();
    
    await interaction.reply({
        content: `✅ Item "${name}" has been removed successfully!`,
        ephemeral: true
    });
    
    // Log the action
    await logAction(interaction, `Removed item: ${name} (Had quantity: ${item.quantity})`);
}

async function handleEditItem(interaction) {
    const name = interaction.options.getString('name').toLowerCase();
    
    if (!inventoryData.items[name]) {
        return await interaction.reply({
            content: `❌ Item "${name}" does not exist.`,
            ephemeral: true
        });
    }
    
    const item = inventoryData.items[name];
    
    // Create modal for editing
    const modal = new ModalBuilder()
        .setCustomId(`edit_item_${name}`)
        .setTitle(`Edit Item: ${item.displayName}`);
    
    const nameInput = new TextInputBuilder()
        .setCustomId('item_name')
        .setLabel('Item Name')
        .setStyle(TextInputStyle.Short)
        .setValue(item.displayName)
        .setRequired(true);
    
    const descriptionInput = new TextInputBuilder()
        .setCustomId('item_description')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(item.description || '')
        .setRequired(false);
    
    const quantityInput = new TextInputBuilder()
        .setCustomId('item_quantity')
        .setLabel('Quantity')
        .setStyle(TextInputStyle.Short)
        .setValue(item.quantity.toString())
        .setRequired(true);
    
    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(quantityInput);
    
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    
    await interaction.showModal(modal);
}

async function handleViewInventory(interaction) {
    if (Object.keys(inventoryData.categories).length === 0) {
        return await interaction.reply({
            content: '📦 Inventory is empty. No categories have been created yet.',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('📦 Inventory Management System')
        .setDescription('Select a category to view items')
        .setColor(0x0099ff)
        .setTimestamp();
    
    // Create select menu for categories
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_category')
        .setPlaceholder('Choose a category to view...');
    
    Object.values(inventoryData.categories).forEach(category => {
        const itemCount = Object.values(inventoryData.items).filter(item => item.category === category.name).length;
        selectMenu.addOptions({
            label: category.displayName,
            description: `${itemCount} items - ${category.description || 'No description'}`,
            value: category.name
        });
    });
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

async function handleAddQuantity(interaction) {
    const itemName = interaction.options.getString('item').toLowerCase();
    const quantity = interaction.options.getInteger('quantity');
    
    if (!inventoryData.items[itemName]) {
        return await interaction.reply({
            content: `❌ Item "${itemName}" does not exist.`,
            ephemeral: true
        });
    }
    
    if (quantity <= 0) {
        return await interaction.reply({
            content: '❌ Quantity must be greater than 0.',
            ephemeral: true
        });
    }
    
    const oldQuantity = inventoryData.items[itemName].quantity;
    inventoryData.items[itemName].quantity += quantity;
    inventoryData.items[itemName].lastModified = new Date().toISOString();
    inventoryData.items[itemName].lastModifiedBy = interaction.user.id;
    
    saveInventoryData();
    
    await interaction.reply({
        content: `✅ Added ${quantity} to "${inventoryData.items[itemName].displayName}". New quantity: ${inventoryData.items[itemName].quantity}`,
        ephemeral: true
    });
    
    // Log the action
    await logAction(interaction, `Added quantity: ${itemName} (+${quantity}) [${oldQuantity} → ${inventoryData.items[itemName].quantity}]`);
}

async function handleRemoveQuantity(interaction) {
    const itemName = interaction.options.getString('item').toLowerCase();
    const quantity = interaction.options.getInteger('quantity');
    
    if (!inventoryData.items[itemName]) {
        return await interaction.reply({
            content: `❌ Item "${itemName}" does not exist.`,
            ephemeral: true
        });
    }
    
    if (quantity <= 0) {
        return await interaction.reply({
            content: '❌ Quantity must be greater than 0.',
            ephemeral: true
        });
    }
    
    if (inventoryData.items[itemName].quantity < quantity) {
        return await interaction.reply({
            content: `❌ Cannot remove ${quantity} items. Current quantity: ${inventoryData.items[itemName].quantity}`,
            ephemeral: true
        });
    }
    
    const oldQuantity = inventoryData.items[itemName].quantity;
    inventoryData.items[itemName].quantity -= quantity;
    inventoryData.items[itemName].lastModified = new Date().toISOString();
    inventoryData.items[itemName].lastModifiedBy = interaction.user.id;
    
    saveInventoryData();
    
    await interaction.reply({
        content: `✅ Removed ${quantity} from "${inventoryData.items[itemName].displayName}". New quantity: ${inventoryData.items[itemName].quantity}`,
        ephemeral: true
    });
    
    // Log the action
    await logAction(interaction, `Removed quantity: ${itemName} (-${quantity}) [${oldQuantity} → ${inventoryData.items[itemName].quantity}]`);
}

async function handleSelectMenuInteraction(interaction) {
    if (interaction.customId === 'select_category') {
        const categoryName = interaction.values[0];
        const category = inventoryData.categories[categoryName];
        const items = Object.values(inventoryData.items).filter(item => item.category === categoryName);
        
        const embed = new EmbedBuilder()
            .setTitle(`📦 ${category.displayName}`)
            .setDescription(category.description || 'No description provided')
            .setColor(0x0099ff)
            .setTimestamp();
        
        if (items.length === 0) {
            embed.addFields({ name: 'Items', value: 'No items in this category', inline: false });
        } else {
            const itemList = items.map(item => 
                `**${item.displayName}** - Quantity: ${item.quantity}\n${item.description ? `*${item.description}*` : '*No description*'}`
            ).join('\n\n');
            
            embed.addFields({ name: `Items (${items.length})`, value: itemList, inline: false });
        }
        
        await interaction.update({
            embeds: [embed],
            components: []
        });
    }
}

async function handleButtonInteraction(interaction) {
    // Handle any button interactions here
}

async function handleModalSubmit(interaction) {
    if (interaction.customId.startsWith('edit_item_')) {
        const itemName = interaction.customId.replace('edit_item_', '');
        const newName = interaction.fields.getTextInputValue('item_name');
        const newDescription = interaction.fields.getTextInputValue('item_description');
        const newQuantity = parseInt(interaction.fields.getTextInputValue('item_quantity'));
        
        if (isNaN(newQuantity) || newQuantity < 0) {
            return await interaction.reply({
                content: '❌ Quantity must be a valid number greater than or equal to 0.',
                ephemeral: true
            });
        }
        
        const item = inventoryData.items[itemName];
        const oldData = { ...item };
        
        // Update item
        item.displayName = newName;
        item.description = newDescription;
        item.quantity = newQuantity;
        item.lastModified = new Date().toISOString();
        item.lastModifiedBy = interaction.user.id;
        
        saveInventoryData();
        
        await interaction.reply({
            content: `✅ Item "${itemName}" has been updated successfully!`,
            ephemeral: true
        });
        
        // Log the action
        await logAction(interaction, `Edited item: ${itemName} (Name: ${oldData.displayName}→${newName}, Qty: ${oldData.quantity}→${newQuantity})`);
    }
}

async function logAction(interaction, action) {
    if (!config.logChannelId) return;
    
    try {
        const logChannel = await client.channels.fetch(config.logChannelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('📝 Inventory Action Log')
                .setDescription(action)
                .addFields(
                    { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                    { name: 'Channel', value: `${interaction.channel.name}`, inline: true },
                    { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setColor(0x00ff00)
                .setTimestamp();
            
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Failed to log action:', error.message);
        console.error('Error logging action:', error);
    }
}

// Login
client.login(config.token);
