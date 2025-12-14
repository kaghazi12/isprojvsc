const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const configPath = path.join(__dirname, "deployedAddress.json");
  
  if (!fs.existsSync(configPath)) {
    console.error("Deployed address not found. Please run 'npx hardhat run scripts/deploy.js' first.");
    process.exitCode = 1;
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const votingAddress = config.votingAddress;

  console.log("Initializing contract at:", votingAddress);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = Voting.attach(votingAddress);

  // The contract hardcodes an admin address; find a signer that matches it
  const HARD_CODED_ADMIN = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase();
  const signers = await hre.ethers.getSigners();
  const adminSigner = signers.find(s => s.address.toLowerCase() === HARD_CODED_ADMIN);
  
  if (!adminSigner) {
    console.error("No local signer matches the hardcoded on-chain admin:", HARD_CODED_ADMIN);
    console.error("Please import the admin private key into your local node or update the contract admin.");
    process.exitCode = 1;
    return;
  }

  const tx1 = await voting.connect(adminSigner).createElection("Student Council 2025", ["Alice", "Bob", "Charlie"], 3600);
  await tx1.wait();
  console.log("First election created (1 hour duration)");

  const tx2 = await voting.connect(adminSigner).createElection("Best Coding Language", ["JavaScript", "Python", "Rust"], 7200);
  await tx2.wait();
  console.log("Second election created (2 hours duration)");

  console.log("Election and candidates initialized successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
