const { execSync } = require('child_process');
const path = require('path');

// Change to functions directory
process.chdir(path.join(__dirname));

try {
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}