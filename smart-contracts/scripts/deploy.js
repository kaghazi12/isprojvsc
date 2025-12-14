const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();
  const votingAddress = voting.target;
  
  console.log("Voting deployed to:", votingAddress);

  // Save the address to a config file for other scripts to use
  const configPath = path.join(__dirname, "deployedAddress.json");
  fs.writeFileSync(configPath, JSON.stringify({ votingAddress }, null, 2));
  console.log("Deployed address saved to:", configPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
