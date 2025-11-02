#!/usr/bin/env node

// Script to enable/disable maintenance mode
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to maintenance flag file
const MAINTENANCE_FLAG = path.join(__dirname, '..', '.maintenance');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'enable') {
  // Create maintenance flag file
  fs.writeFileSync(MAINTENANCE_FLAG, 'Maintenance mode enabled at ' + new Date().toISOString());
  console.log('✅ Maintenance mode ENABLED');
  console.log('The website will now show the maintenance page to all users.');
} else if (command === 'disable') {
  // Remove maintenance flag file
  if (fs.existsSync(MAINTENANCE_FLAG)) {
    fs.unlinkSync(MAINTENANCE_FLAG);
    console.log('✅ Maintenance mode DISABLED');
    console.log('The website is now back online.');
  } else {
    console.log('ℹ️  Maintenance mode is already disabled');
  }
} else if (command === 'status') {
  // Check maintenance status
  if (fs.existsSync(MAINTENANCE_FLAG)) {
    const content = fs.readFileSync(MAINTENANCE_FLAG, 'utf8');
    console.log('🔧 Maintenance mode is currently ENABLED');
    console.log('Created at:', content);
  } else {
    console.log('✅ Maintenance mode is currently DISABLED');
    console.log('The website is operating normally.');
  }
} else {
  console.log('Usage: node scripts/maintenance.js [enable|disable|status]');
  console.log('');
  console.log('Commands:');
  console.log('  enable   - Enable maintenance mode');
  console.log('  disable  - Disable maintenance mode');
  console.log('  status   - Check current maintenance status');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/maintenance.js enable');
  console.log('  node scripts/maintenance.js disable');
  console.log('  node scripts/maintenance.js status');
}