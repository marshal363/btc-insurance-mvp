// This script is used to run the Next.js application
// It will be executed by the Replit workflow

console.log("Starting Next.js application...");

// Try to execute the Next.js dev command
import { spawn } from 'child_process';
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  if (code !== 0) {
    console.log("Trying alternative startup method...");
    // If Next.js fails, try running our shell script
    const shellProcess = spawn('./start-next.sh', [], {
      stdio: 'inherit',
      shell: true
    });
    
    shellProcess.on('close', (shellCode) => {
      console.log(`Shell script process exited with code ${shellCode}`);
      process.exit(shellCode);
    });
  } else {
    process.exit(code);
  }
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