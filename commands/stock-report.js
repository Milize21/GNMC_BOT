// stock-report.js - Example custom command for Inventory Bot
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load inventory data
function loadInventoryData() {
  try {
    if (fs.existsSync('./data/inventory.json')) {
      const data = fs.readFileSync('./data/inventory.json', 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading inventory data:', error);
  }
  return { categories: {}, items: {} };
}

// Create the command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('stock-report')
    .setDescription('Generate a stock level report')
    .addStringOption(option => 
      option.setName('category')
        .setDescription('Filter by category (optional)')
        .setRequired(false)),
  
  async execute(interaction) {
    try {
      // Load inventory data
      const inventoryData = loadInventoryData();
      const categoryFilter = interaction.options.getString('category')?.toLowerCase();
      
      // Generate report
      let items = Object.values(inventoryData.items);
      
      // Apply category filter if provided
      if (categoryFilter) {
        if (!inventoryData.categories[categoryFilter]) {
          return await interaction.reply({
            content: `❌ Category "${categoryFilter}" does not exist.`,
            ephemeral: true
          });
        }
        
        items = items.filter(item => item.category === categoryFilter);
      }
      
      // Sort by quantity (lowest to highest)
      items.sort((a, b) => a.quantity - b.quantity);
      
      // Create report embed
      const embed = new EmbedBuilder()
        .setTitle('📊 Stock Level Report')
        .setDescription(categoryFilter 
          ? `Stock levels for category: ${inventoryData.categories[categoryFilter].displayName}`
          : 'Current stock levels for all items')
        .setColor(0x0099ff)
        .setTimestamp();
      
      if (items.length === 0) {
        embed.addFields({ name: 'No Items', value: 'No items found in inventory', inline: false });
      } else {
        // Group items by stock level
        const lowStock = items.filter(item => item.quantity < 10);
        const mediumStock = items.filter(item => item.quantity >= 10 && item.quantity < 50);
        const highStock = items.filter(item => item.quantity >= 50);
        
        // Add fields for each group
        if (lowStock.length > 0) {
          embed.addFields({ 
            name: '⚠️ Low Stock Items (< 10)',
            value: lowStock.map(item => `**${item.displayName}**: ${item.quantity}`).join('\n') || 'None',
            inline: false
          });
        }
        
        if (mediumStock.length > 0) {
          embed.addFields({ 
            name: '📦 Medium Stock Items (10-49)',
            value: mediumStock.map(item => `**${item.displayName}**: ${item.quantity}`).join('\n') || 'None',
            inline: false
          });
        }
        
        if (highStock.length > 0) {
          embed.addFields({ 
            name: '✅ High Stock Items (50+)',
            value: highStock.map(item => `**${item.displayName}**: ${item.quantity}`).join('\n') || 'None',
            inline: false
          });
        }
        
        // Add summary
        embed.addFields({ 
          name: 'Summary', 
          value: `Total items: ${items.length}\nLow stock: ${lowStock.length}\nMedium stock: ${mediumStock.length}\nHigh stock: ${highStock.length}`,
          inline: false
        });
      }
      
      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      
    } catch (error) {
      console.error('Error executing stock-report command:', error);
      await interaction.reply({
        content: `❌ An error occurred while generating the report: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
