const { execSync } = require('child_process');
const path = require('path');

// Change to functions directory
process.chdir(path.join(__dirname));

try {
  console.log('Installing Firebase Functions dependencies...');
  execSync('npm install firebase-functions firebase-admin', { stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}