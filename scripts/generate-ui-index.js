#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components', 'ui');
const componentsIndexPath = path.join(__dirname, 'src', 'components', 'ui', 'index.ts');

if (!fs.existsSync(componentsDir)) {
  console.error('UI components directory not found');
  process.exit(1);
}

const componentFiles = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
  .filter(file => !file.startsWith('index'))
  .filter(file => !file.startsWith('_'));

const exports = componentFiles.map(file => {
  const componentName = path.parse(file).name;
  const exportName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  return `export { default as ${exportName} } from './${componentName}';`;
}).join('\n');

fs.writeFileSync(componentsIndexPath, exports);

console.log(`Generated index.ts with ${componentFiles.length} component exports`);
