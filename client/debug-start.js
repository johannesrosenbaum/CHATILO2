console.log('🔧 DEBUG: Starting React app manually...');
console.log('   Node version:', process.version);
console.log('   Working directory:', process.cwd());
console.log('   Environment variables:');
console.log('     NODE_ENV:', process.env.NODE_ENV);
console.log('     PORT:', process.env.PORT);

// Check for common issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking project structure...');
console.log('   package.json exists:', fs.existsSync('./package.json'));
console.log('   src folder exists:', fs.existsSync('./src'));
console.log('   node_modules exists:', fs.existsSync('./node_modules'));
console.log('   public folder exists:', fs.existsSync('./public'));

// Try to start react-scripts
try {
  console.log('🚀 Attempting to start react-scripts...');
  require('react-scripts/scripts/start');
} catch (error) {
  console.error('❌ Error starting react-scripts:', error.message);
  console.error('Full error:', error);
}
