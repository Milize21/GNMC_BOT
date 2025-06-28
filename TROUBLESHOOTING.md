# Troubleshooting Guide for Your Inventory Bot

## Common Issues and Solutions

### 1. Item "gun" does not exist
The error you saw when using `/inventory add-quantity` means you tried to add quantity to an item that isn't in your inventory.

**Available items are:**
- example_item
- laptop
- monitor
- notepad

**How to add quantity to an existing item:**
```
/inventory add-quantity item:laptop quantity:5
```

**How to create a new item first:**
```
/inventory-admin add-item name:gun category:general description:Handgun initial-quantity:0
```
Then you can add quantity to it.

### 2. The application did not respond
This happens when there's an error or timeout in processing the admin command.

**Possible fixes:**
1. Make sure you have administrator permissions in the Discord server
2. Use the exact category name that exists (general, electronics, or office)
3. Check if the item name already exists (it must be unique)

### 3. Understanding Item IDs vs Display Names

When using commands, you need to use the **item ID** (the internal name), not the display name:

- ❌ Wrong: `/inventory add-quantity item:Laptop quantity:5`
- ✅ Right: `/inventory add-quantity item:laptop quantity:5`

### 4. Adding New Items Step-by-Step

1. Choose an existing category (general, electronics, office)
2. Use this command:
```
/inventory-admin add-item name:gun category:general description:Handgun initial-quantity:5
```
3. Make sure "name" is lowercase with no spaces (use underscore if needed)

### 5. Adding New Categories

If you want a new category for guns:
```
/inventory-admin add-category name:weapons description:Weapons and ammunition
```
Then add items to it:
```
/inventory-admin add-item name:gun category:weapons description:Handgun initial-quantity:5
```

## Next Steps

1. Restart your bot: `node index.js`
2. Try adding a new category if needed
3. Add your new item(s)
4. Use the view command to see all items: `/inventory view`

## Bot Setup Reminder
- Your bot is already configured with your token
- Make sure you have administrator permissions in Discord
- If you get "application did not respond" errors, check the command syntax
