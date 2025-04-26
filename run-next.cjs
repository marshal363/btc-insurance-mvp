// This script is used to run the Next.js application
// Using CommonJS format to avoid module issues

console.log("Starting Next.js application...");

// Try to execute the Next.js dev command
const { spawn } = require('child_process');
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down Next.js...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down Next.js...');
  nextProcess.kill('SIGTERM');
});