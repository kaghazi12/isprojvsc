const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = Voting.attach(CONTRACT_ADDRESS);

  try {
    const count = await voting.electionCount();
    console.log("electionCount:", count.toString());
  } catch (err) {
    console.error("Could not read electionCount (maybe ABI mismatch or wrong address):", err.message || err);
  }

  try {
    const e1 = await voting.getElection(1);
    console.log("Election 1:", e1);
  } catch (err) {
    console.error("Could not read election 1:", err.message || err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
