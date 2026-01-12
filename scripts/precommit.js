#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🚀 Running pre-commit tasks...');

try {
  console.log('\n🔍 Running lint-staged...');
  execSync('npx lint-staged', { stdio: 'inherit' });

  console.log('\n✅ All pre-commit checks passed!');
} catch {
  console.error('\n❌ Pre-commit checks failed. Please fix issues before committing.');
  process.exit(1);
}
