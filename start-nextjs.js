// Simple script to start Next.js application
import { execSync } from 'child_process';

try {
  console.log('Starting Next.js application...');
  execSync('npx next dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting Next.js application:', error);
  process.exit(1);
}