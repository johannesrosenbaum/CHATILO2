const fs = require('fs');
const path = require('path');

console.log('🔍 CHATILO VERSION COMPARISON');
console.log('============================\n');

// Vergleiche kritische Dateien zwischen client/ und src/
const criticalFiles = [
  'App.tsx',
  'contexts/SocketContext.tsx',
  'contexts/AuthContext.tsx',
  'components/ChatInterface.tsx',
  'components/ChatRoomList.tsx',
  'components/MessageItem.tsx'
];

function readFileContent(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const size = (content.length / 1024).toFixed(1);
      return { exists: true, lines, size, content };
    }
    return { exists: false };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

function extractImports(content) {
  const imports = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('import')) {
      imports.push(line.trim());
    }
  }
  return imports;
}

function extractFunctions(content) {
  const functions = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('function ') || line.includes('const ') && line.includes('= ')) {
      functions.push(line.trim());
    }
  }
  return functions.slice(0, 10); // Nur die ersten 10
}

console.log('📊 FILE COMPARISON:\n');

for (const file of criticalFiles) {
  console.log(`\n📄 ${file}:`);
  console.log('─'.repeat(50));
  
  const clientPath = path.join('client', 'src', file);
  const srcPath = path.join('src', file);
  
  const clientFile = readFileContent(clientPath);
  const srcFile = readFileContent(srcPath);
  
  console.log(`client/src/${file}:`);
  if (clientFile.exists) {
    console.log(`  ✅ EXISTS - ${clientFile.lines} lines, ${clientFile.size}KB`);
    const clientImports = extractImports(clientFile.content);
    console.log(`  📦 Imports: ${clientImports.length}`);
    if (clientImports.length > 0) {
      console.log(`     First 3: ${clientImports.slice(0, 3).join('; ')}`);
    }
  } else {
    console.log(`  ❌ NOT FOUND`);
  }
  
  console.log(`src/${file}:`);
  if (srcFile.exists) {
    console.log(`  ✅ EXISTS - ${srcFile.lines} lines, ${srcFile.size}KB`);
    const srcImports = extractImports(srcFile.content);
    console.log(`  📦 Imports: ${srcImports.length}`);
    if (srcImports.length > 0) {
      console.log(`     First 3: ${srcImports.slice(0, 3).join('; ')}`);
    }
  } else {
    console.log(`  ❌ NOT FOUND`);
  }
  
  // Größenvergleich
  if (clientFile.exists && srcFile.exists) {
    const sizeDiff = Math.abs(parseFloat(clientFile.size) - parseFloat(srcFile.size));
    const lineDiff = Math.abs(clientFile.lines - srcFile.lines);
    console.log(`  📏 Differences: ${sizeDiff}KB size, ${lineDiff} lines`);
    
    if (sizeDiff > 5 || lineDiff > 50) {
      console.log(`  ⚠️ SIGNIFICANT DIFFERENCES DETECTED!`);
    }
  }
}

// Prüfe package.json Inhalte
console.log('\n\n📦 PACKAGE.JSON COMPARISON:\n');
console.log('─'.repeat(50));

const clientPkg = readFileContent('client/package.json');
const rootPkg = readFileContent('package.json');

if (clientPkg.exists) {
  try {
    const clientPkgData = JSON.parse(clientPkg.content);
    console.log(`client/package.json:`);
    console.log(`  Name: ${clientPkgData.name}`);
    console.log(`  Scripts: ${Object.keys(clientPkgData.scripts || {}).join(', ')}`);
    console.log(`  Dependencies: ${Object.keys(clientPkgData.dependencies || {}).length}`);
    console.log(`  Key deps: react@${clientPkgData.dependencies?.react}, @mui/material@${clientPkgData.dependencies?.['@mui/material']}`);
  } catch (e) {
    console.log(`  ❌ Invalid JSON: ${e.message}`);
  }
}

if (rootPkg.exists) {
  try {
    const rootPkgData = JSON.parse(rootPkg.content);
    console.log(`\nroot package.json:`);
    console.log(`  Name: ${rootPkgData.name}`);
    console.log(`  Scripts: ${Object.keys(rootPkgData.scripts || {}).join(', ')}`);
    console.log(`  Dependencies: ${Object.keys(rootPkgData.dependencies || {}).length}`);
  } catch (e) {
    console.log(`  ❌ Invalid JSON: ${e.message}`);
  }
}

// Check welche Version läuft aktuell
console.log('\n\n🚀 CURRENTLY RUNNING VERSION:\n');
console.log('─'.repeat(50));

if (fs.existsSync('client/package.json')) {
  console.log('✅ client/ version is set up');
  console.log('   To run: cd client && npm start');
}

if (fs.existsSync('src/App.tsx')) {
  console.log('✅ src/ version is set up');  
  console.log('   To run: npm start (if tsconfig.json in root)');
}

console.log('\n💡 RECOMMENDATIONS:');
console.log('─'.repeat(50));
console.log('1. Check which version worked last');
console.log('2. Compare the file contents manually');
console.log('3. Keep the working version, archive the other');
console.log('4. DO NOT delete anything until we confirm the working version');

console.log('\n🔍 Next steps:');
console.log('- Tell me which version was working');
console.log('- We can make a backup before cleanup');
console.log('- Test both versions side by side');
