#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('Running pre-commit checks...');

try {
  console.log('\n🔍 Running ESLint...');
  execSync('bun run lint:fix', { stdio: 'inherit' });

  console.log('\n✨ Formatting code with Prettier...');
  execSync('bun run format', { stdio: 'inherit' });

  console.log('\n✅ All pre-commit checks passed!');
} catch (error) {
  console.error('\n❌ Pre-commit checks failed. Please fix the issues and try again.');
  process.exit(1);
}
