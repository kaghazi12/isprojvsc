const { ethers } = require('hardhat');

async function advanceTime(seconds) {
  console.log(`Advancing time by ${seconds} seconds...`);
  
  // Advance time
  await ethers.provider.send('hardhat_mine', ['0x1', '0x' + (seconds).toString(16)]);
  
  // Get current time
  const block = await ethers.provider.getBlock('latest');
  console.log(`✓ Time advanced. Current blockchain timestamp: ${block.timestamp}`);
}

async function main() {
  // Advance time by 4000 seconds (more than 1 hour for faster testing)
  await advanceTime(4000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
