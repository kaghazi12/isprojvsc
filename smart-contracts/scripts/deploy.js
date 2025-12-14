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

  // Update the frontend's contractConfig.js with the new address
  const frontendConfigPath = path.join(__dirname, "..", "..", "client", "src", "utils", "contractConfig.js");
  const contractConfigContent = fs.readFileSync(frontendConfigPath, "utf8");
  const updatedConfig = contractConfigContent.replace(
    /export const CONTRACT_ADDRESS = "0x[0-9a-fA-F]{40}";/,
    `export const CONTRACT_ADDRESS = "${votingAddress}";`
  );
  fs.writeFileSync(frontendConfigPath, updatedConfig);
  console.log("Updated frontend contractConfig.js with new address");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
