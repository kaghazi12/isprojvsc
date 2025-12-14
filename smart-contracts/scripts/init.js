const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  console.log("Voting deployed to:", voting.target); // use voting.target for the address

  // You can call initialization here directly using deployer
  // Create election with initial candidates in one call
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

    const tx1 = await voting.connect(adminSigner).createElection("Student Council 2025", ["Alice", "Bob"]);
    await tx1.wait();

  console.log("Election and candidates initialized successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
