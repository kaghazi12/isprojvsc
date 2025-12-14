import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';

export default function VotePage() {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [account, setAccount] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [totalVotes, setTotalVotes] = useState(null);

  // Load elections on mount
  useEffect(() => {
    async function loadElections() {
      try {
        console.log('Loading elections...');
        const provider = window.ethereum 
          ? new BrowserProvider(window.ethereum) 
          : new JsonRpcProvider('http://127.0.0.1:8545');
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log('Contract created:', CONTRACT_ADDRESS);
        const countBn = await contract.electionCount();
        console.log('Election count:', countBn.toString());
        const count = Number(countBn.toString());
        const list = [];
        
        for (let i = 1; i <= count; i++) {
          const e = await contract.getElection(i);
          console.log('Loaded election', i, ':', e.name);
          list.push({
            id: Number(e.id),
            name: e.name,
            isActive: e.isActive,
            candidateCount: Number(e.candidateCount)
          });
        }
        
        console.log('Elections loaded:', list);
        setElections(list);
        if (list.length > 0) setSelected(list[0].id);
      } catch (err) {
        console.error('Failed to load elections:', err);
        setError('Failed to load elections: ' + (err?.message || err));
      }
    }
    
    loadElections();
  }, []);

  // Get account from MetaMask
  useEffect(() => {
    async function getAccount() {
      try {
        if (!window.ethereum) return;
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error('Failed to get account:', err);
      }
    }
    
    getAccount();
  }, []);

  // Load candidates and check if user has voted
  useEffect(() => {
    async function loadCandidates() {
      if (!selected) {
        console.log('No election selected');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Loading candidates for election:', selected);
        
        const provider = window.ethereum 
          ? new BrowserProvider(window.ethereum) 
          : new JsonRpcProvider('http://127.0.0.1:8545');
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log('Getting election data...');
        const election = await contract.getElection(Number(selected));
        console.log('Election data received:', election);
        
        const candidateCount = Number(election.candidateCount);
        console.log('Candidate count:', candidateCount);
        
        const cands = [];
        
        for (let i = 1; i <= candidateCount; i++) {
          console.log('Fetching candidate', i);
          const cand = await contract.getCandidate(Number(selected), i);
          console.log('Candidate', i, 'data:', cand);
          // Access struct fields by index or by property name
          cands.push({
            id: Number(cand[0] || cand.id),
            name: cand[1] || cand.name,
            voteCount: Number(cand[2] || cand.voteCount)
          });
        }
        
        console.log('All candidates loaded:', cands);
        setCandidates(cands);
        
        // Calculate total votes for this election
        const electionTotal = cands.reduce((sum, cand) => sum + cand.voteCount, 0);
        console.log('Total votes for this election:', electionTotal);
        setTotalVotes(electionTotal);
        
        // Check if user has already voted
        if (account) {
          console.log('Checking if user voted:', account);
          const voted = await contract.hasVotedInElection(Number(selected), account);
          console.log('User voted:', voted);
          setHasVoted(voted);
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
        console.error('Full error:', JSON.stringify(err, null, 2));
        console.error('Contract address:', CONTRACT_ADDRESS);
        console.error('Error message:', err?.message);
        console.error('Error code:', err?.code);
        setError('Failed to load candidates: ' + (err?.message || err));
      } finally {
        setLoading(false);
      }
    }
    
    loadCandidates();
  }, [selected, account]);

  // Recalculate total votes whenever candidates change
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      const electionTotal = candidates.reduce((sum, cand) => sum + cand.voteCount, 0);
      setTotalVotes(electionTotal);
    }
  }, [candidates]);

  const handleVote = async (candidateId) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask is required to vote');
      return;
    }

    try {
      setVoting(true);
      setError(null);
      setSuccess(null);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.vote(Number(selected), candidateId);
      await tx.wait();

      setSuccess('Vote cast successfully!');
      setHasVoted(true);
      
      // Reload candidates to update vote counts
      const election = await contract.getElection(Number(selected));
      const candidateCount = Number(election.candidateCount);
      const cands = [];
      
      for (let i = 1; i <= candidateCount; i++) {
        const cand = await contract.getCandidate(Number(selected), i);
        cands.push({
          id: Number(cand.id),
          name: cand.name,
          voteCount: Number(cand.voteCount)
        });
      }
      
      setCandidates(cands);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to vote:', err);
      if (err.reason) {
        setError(err.reason);
      } else {
        setError('Failed to cast vote. Please try again.');
      }
    } finally {
      setVoting(false);
    }
  };

  const election = elections.find(e => e.id === selected);

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-6 text-primary">Cast Your Vote</h1>

      {account && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </div>
      )}

      {!account && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          Please connect your wallet to vote
        </div>
      )}

      {error && <div className="text-red-500 mb-4 p-3 bg-red-100 rounded">{error}</div>}
      {success && <div className="text-green-500 mb-4 p-3 bg-green-100 rounded">{success}</div>}

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <span className="text-lg text-primary">Total votes cast:</span> 
        <span className="text-lg text-primary ml-2">{totalVotes}</span>
      </div>

      {elections.length === 0 ? (
        <p className="text-center text-gray-500">No elections available</p>
      ) : (
        <>
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Select Election:</label>
            <select
              value={selected ?? ''}
              onChange={(e) => {
                setSelected(Number(e.target.value));
                setHasVoted(false);
              }}
              className="w-full border p-2 rounded bg-background text-foreground"
            >
              {elections.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.name} {el.isActive ? '(Active)' : '(Closed)'}
                </option>
              ))}
            </select>
          </div>

          {election && !election.isActive && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-center font-semibold">
              This election is closed. Results are finalized.
            </div>
          )}

          {election && election.isActive && hasVoted && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded text-center font-semibold">
              You have already voted in this election
            </div>
          )}

          {loading ? (
            <p className="text-center">Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <p className="text-center text-gray-500">No candidates in this election</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 border rounded-lg bg-card hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold mb-4">{candidate.name}</h3>
                  
                  {election.isActive ? (
                    <button
                      onClick={() => handleVote(candidate.id)}
                      disabled={voting || hasVoted || !account}
                      className={`w-full py-2 px-4 rounded font-semibold transition ${
                        hasVoted
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : !account
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : voting
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'cosmic-button'
                      }`}
                    >
                      {voting ? 'Voting...' : hasVoted ? 'Already Voted' : `Vote for ${candidate.name}`}
                    </button>
                  ) : (
                    <div className="w-full py-2 px-4 rounded font-semibold text-center bg-gray-300 text-gray-600">
                      Election Closed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
