// Run Next.js without needing to modify package.json
import { exec } from 'child_process';

console.log('Starting Next.js application...');
const nextProcess = exec('npx next dev -p 3000', { stdio: 'inherit' });

nextProcess.stdout?.on('data', (data) => {
  console.log(data);
});

nextProcess.stderr?.on('data', (data) => {
  console.error(data);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});

// Keep process running
process.on('SIGINT', () => {
  nextProcess.kill();
  process.exit();
});