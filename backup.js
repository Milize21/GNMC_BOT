// backup.js - Script to backup inventory data
const fs = require('fs');
const path = require('path');

// Create timestamp format YYYY-MM-DD_HH-MM-SS
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Main backup function
function backupInventory() {
  try {
    console.log('\x1b[36m%s\x1b[0m', '=======================================================');
    console.log('\x1b[36m%s\x1b[0m', '||            INVENTORY BACKUP UTILITY              ||');
    console.log('\x1b[36m%s\x1b[0m', '=======================================================');
    
    // Check if data directory exists
    if (!fs.existsSync('./data')) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Error: Data directory not found.');
      return;
    }
    
    // Check if inventory file exists
    if (!fs.existsSync('./data/inventory.json')) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Error: Inventory data file not found.');
      return;
    }
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync('./backups')) {
      fs.mkdirSync('./backups');
      console.log('\x1b[32m%s\x1b[0m', '✅ Created backups directory');
    }
    
    // Read the inventory data
    const inventoryData = fs.readFileSync('./data/inventory.json', 'utf8');
    
    // Create backup filename with timestamp
    const timestamp = getTimestamp();
    const backupFilename = `inventory_backup_${timestamp}.json`;
    const backupPath = path.join('./backups', backupFilename);
    
    // Write backup file
    fs.writeFileSync(backupPath, inventoryData);
    
    console.log('\x1b[32m%s\x1b[0m', `✅ Backup created successfully: ${backupPath}`);
    
    // Get list of backups and count
    const backups = fs.readdirSync('./backups')
      .filter(file => file.startsWith('inventory_backup_'))
      .sort()
      .reverse();
    
    console.log('\x1b[36m%s\x1b[0m', `\nTotal backups: ${backups.length}`);
    console.log('\x1b[36m%s\x1b[0m', 'Most recent backups:');
    
    // Show the 5 most recent backups
    backups.slice(0, 5).forEach((backup, index) => {
      console.log(`  ${index + 1}. ${backup}`);
    });
    
    console.log('\n\x1b[33m%s\x1b[0m', 'To restore a backup, copy the backup file to ./data/inventory.json');
    console.log('\x1b[33m%s\x1b[0m', 'Example: copy .\\backups\\inventory_backup_TIMESTAMP.json .\\data\\inventory.json');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error during backup: ${error.message}`);
  }
}

// Run the backup function
backupInventory();
