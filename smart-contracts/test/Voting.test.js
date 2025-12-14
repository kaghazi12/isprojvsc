const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting, voting, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    // find a signer that matches the hardcoded on-chain admin (if present)
    const FIXED_ADMIN = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase();
    const all = await ethers.getSigners();
    adminSigner = all.find(s => s.address.toLowerCase() === FIXED_ADMIN) || owner;
  });

  it("prevents the same voter from voting twice in the same election", async function () {
    await voting.connect(adminSigner).createElection("Election 1", ["Alice"]);

    await voting.connect(addr1).vote(1, 1);

    await expect(voting.connect(addr1).vote(1, 1)).to.be.revertedWith("You have already voted");
  });

  it("allows same voter to vote in different elections", async function () {
    await voting.connect(adminSigner).createElection("Election 1", ["Alice"]);

    await voting.connect(adminSigner).createElection("Election 2", ["Bob"]);

    await voting.connect(addr1).vote(1, 1);
    await voting.connect(addr1).vote(2, 1);

    const c1 = await voting.getCandidate(1, 1);
    const c2 = await voting.getCandidate(2, 1);

    expect(Number(c1.voteCount)).to.equal(1);
    expect(Number(c2.voteCount)).to.equal(1);
  });
});
