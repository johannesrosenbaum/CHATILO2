const fs = require('fs');
const path = require('path');

function analyzeDirectory(dirPath, indent = '') {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      // Skip node_modules und .git
      if (item === 'node_modules' || item === '.git' || item.startsWith('.')) {
        continue;
      }
      
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        results.push(`${indent}📁 ${item}/`);
        results.push(...analyzeDirectory(fullPath, indent + '  '));
      } else {
        results.push(`${indent}📄 ${item}`);
      }
    }
  } catch (error) {
    results.push(`${indent}❌ Error reading: ${error.message}`);
  }
  
  return results;
}

function findDuplicateComponents() {
  const componentPaths = [];
  
  function searchComponents(dir, basePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (item === 'node_modules' || item === '.git') continue;
        
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          if (item === 'components') {
            componentPaths.push(relativePath);
          }
          searchComponents(fullPath, relativePath);
        } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
          componentPaths.push(relativePath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }
  
  searchComponents(process.cwd());
  return componentPaths;
}

function findPackageJsonFiles() {
  const packageFiles = [];
  
  function searchPackageJson(dir, basePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (item === 'node_modules' || item === '.git') continue;
        
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          searchPackageJson(fullPath, relativePath);
        } else if (item === 'package.json') {
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            packageFiles.push({
              path: relativePath,
              name: content.name,
              scripts: Object.keys(content.scripts || {}),
              dependencies: Object.keys(content.dependencies || {}),
            });
          } catch (e) {
            packageFiles.push({
              path: relativePath,
              error: 'Invalid JSON'
            });
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }
  
  searchPackageJson(process.cwd());
  return packageFiles;
}

console.log('🔍 CHATILO PROJECT STRUCTURE ANALYSIS');
console.log('=====================================\n');

console.log('📁 COMPLETE DIRECTORY STRUCTURE:');
console.log('--------------------------------');
const structure = analyzeDirectory(process.cwd());
structure.forEach(line => console.log(line));

console.log('\n🔍 COMPONENT DIRECTORIES & FILES:');
console.log('----------------------------------');
const components = findDuplicateComponents();
components.forEach(comp => {
  if (comp.includes('components')) {
    console.log(`📁 ${comp}`);
  } else if (comp.endsWith('.tsx') || comp.endsWith('.jsx')) {
    console.log(`📄 ${comp}`);
  }
});

console.log('\n📦 PACKAGE.JSON FILES:');
console.log('----------------------');
const packages = findPackageJsonFiles();
packages.forEach(pkg => {
  console.log(`📦 ${pkg.path}`);
  if (pkg.name) {
    console.log(`   Name: ${pkg.name}`);
    console.log(`   Scripts: ${pkg.scripts.join(', ')}`);
    console.log(`   Dependencies: ${pkg.dependencies.length} packages`);
  } else {
    console.log(`   ❌ ${pkg.error}`);
  }
  console.log('');
});

console.log('\n🚨 POTENTIAL ISSUES:');
console.log('--------------------');

// Check for duplicate component directories
const componentDirs = components.filter(c => c.includes('components') && c.endsWith('components'));
if (componentDirs.length > 1) {
  console.log('❌ DUPLICATE COMPONENT DIRECTORIES FOUND:');
  componentDirs.forEach(dir => console.log(`   - ${dir}`));
  console.log('');
}

// Check for duplicate React apps
const reactApps = packages.filter(pkg => 
  pkg.dependencies && pkg.dependencies.includes('react')
);
if (reactApps.length > 1) {
  console.log('❌ MULTIPLE REACT APPS FOUND:');
  reactApps.forEach(app => console.log(`   - ${app.path} (${app.name})`));
  console.log('');
}

// Check for duplicate servers
const servers = packages.filter(pkg => 
  pkg.dependencies && (pkg.dependencies.includes('express') || pkg.dependencies.includes('fastify'))
);
if (servers.length > 1) {
  console.log('❌ MULTIPLE SERVERS FOUND:');
  servers.forEach(server => console.log(`   - ${server.path} (${server.name})`));
  console.log('');
}

console.log('\n💡 RECOMMENDATIONS:');
console.log('-------------------');
console.log('1. Use only ONE React app directory (client/ or src/)');
console.log('2. Use only ONE server directory (server/)');
console.log('3. Remove duplicate component directories');
console.log('4. Ensure package.json files are only in root directories');
console.log('\nRun this script: node analyze-structure.js');
