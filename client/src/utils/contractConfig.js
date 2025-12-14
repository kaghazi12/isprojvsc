export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "electionCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVotes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_electionId", "type": "uint256"}],
    "name": "getElection",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "candidateCount", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_electionId", "type": "uint256"},
      {"internalType": "uint256", "name": "_candidateId", "type": "uint256"}
    ],
    "name": "getCandidate",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
        ],
        "internalType": "struct Voting.Candidate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_electionId", "type": "uint256"}],
    "name": "getElectionResults",
    "outputs": [
      {"internalType": "uint256[]", "name": "ids", "type": "uint256[]"},
      {"internalType": "string[]", "name": "names", "type": "string[]"},
      {"internalType": "uint256[]", "name": "votes", "type": "uint256[]"},
      {"internalType": "uint256", "name": "winnerId", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "electionId", "type": "uint256"},
      {"internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "hasVotedInElection",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "electionId", "type": "uint256"},
      {"internalType": "uint256", "name": "candidateId", "type": "uint256"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];
