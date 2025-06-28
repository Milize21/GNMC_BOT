# Inventory Bot Quick Reference Guide

## Starting the Bot
1. Run `start.bat` to launch the bot
2. If no configuration is found, the setup wizard will run automatically
3. Alternatively, you can run `node setup.js` to reconfigure the bot

## Admin Commands
| Command | Description | Example |
|---------|-------------|---------|
| `/inventory-admin add-category` | Add a new category | `/inventory-admin add-category name:Electronics description:Tech devices` |
| `/inventory-admin remove-category` | Remove a category | `/inventory-admin remove-category name:Electronics` |
| `/inventory-admin add-item` | Add a new item | `/inventory-admin add-item name:Laptop category:Electronics description:Dell XPS 15 initial-quantity:5` |
| `/inventory-admin remove-item` | Remove an item | `/inventory-admin remove-item name:Laptop` |
| `/inventory-admin edit-item` | Edit an existing item | `/inventory-admin edit-item name:Laptop` |

## User Commands
| Command | Description | Example |
|---------|-------------|---------|
| `/inventory view` | Browse inventory by category | `/inventory view` |
| `/inventory add-quantity` | Add quantity to an item | `/inventory add-quantity item:Laptop quantity:3` |
| `/inventory remove-quantity` | Remove quantity from an item | `/inventory remove-quantity item:Laptop quantity:1` |

## Troubleshooting
1. **Bot not responding?** Check if it's online in your Discord server and has the proper permissions
2. **Command not working?** Ensure the bot has permission to create and use slash commands
3. **Cannot see inventory?** Verify the channel IDs in your config.json
4. **Error about missing modules?** Run `npm install` to install dependencies

## Data Backup
The inventory data is stored in `data/inventory.json`. Back up this file regularly to prevent data loss.

## Getting Help
If you need additional assistance, refer to the README.md file or review your configuration in config.json.
