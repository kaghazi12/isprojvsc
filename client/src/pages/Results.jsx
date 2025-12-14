import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';

export default function ResultsPage() {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [totalVotes, setTotalVotes] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const provider = window.ethereum ? new BrowserProvider(window.ethereum) : new JsonRpcProvider('http://127.0.0.1:8545');
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const countBn = await contract.electionCount();
        const count = Number(countBn.toString());
        const list = [];
        for (let i = 1; i <= count; i++) {
          const e = await contract.getElection(i);
          list.push({ id: Number(e.id), name: e.name, isActive: e.isActive, candidateCount: Number(e.candidateCount) });
        }
        try {
          const tv = await contract.totalVotes();
          if (!cancelled) setTotalVotes(Number(tv.toString()));
        } catch (tvErr) {
          console.debug('Failed to read totalVotes in Results page', tvErr?.message || tvErr);
        }
        if (!cancelled) {
          setElections(list);
          if (list.length > 0) setSelected(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load elections', err);
        if (!cancelled) setError('Failed to load elections');
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchResults = async (id) => {
    setError(null);
    if (!id) return;
    setLoading(true);
    setResults(null);
    try {
      const provider = window.ethereum ? new BrowserProvider(window.ethereum) : new JsonRpcProvider('http://127.0.0.1:8545');
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const e = await contract.getElection(Number(id));
      if (e.isActive) {
        setResults({ ongoing: true });
        setLoading(false);
        return;
      }

      const res = await contract.getElectionResults(Number(id));
      const ids = res[0].map((v) => Number(v.toString()));
      const names = res[1].map((s) => s);
      const votes = res[2].map((v) => Number(v.toString()));
      const winnerId = Number(res[3].toString());

      setResults({ ongoing: false, ids, names, votes, winnerId });
    } catch (err) {
      console.error('Failed to fetch results', err);
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected !== null) fetchResults(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-6 text-primary">Election Results</h1>

      <div className="mb-4">
        <strong>Total votes cast:</strong> {totalVotes === null ? 'Loading...' : totalVotes}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4 flex items-center gap-3">
        <label className="mr-2">Select Election:</label>
        <select value={selected ?? ''} onChange={(e) => setSelected(Number(e.target.value))} className="border p-2 rounded text-forground bg-background">
          {elections.map((el) => (
            <option key={el.id} value={el.id}>{el.name} {el.isActive ? '(ongoing)' : '(concluded)'}</option>
          ))}
        </select>
        <button className="cosmic-button ml-2" onClick={() => fetchResults(selected)}>Refresh</button>
      </div>

      {loading && <div>Loading results...</div>}

      {!loading && results && results.ongoing && (
        <div className="text-yellow-600">Election is still ongoing</div>
      )}

      {!loading && results && !results.ongoing && (
        <div>
          <div className="mb-4">Results for <strong>{elections.find(e => e.id === selected)?.name}</strong></div>
          <div className="table-wrap">
            <table className="table bg-background">
              <thead>
                <tr>
                  <th className="px-4 py-2">Candidate ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Votes</th>
                </tr>
              </thead>
              <tbody>
                {results.ids.map((cid, idx) => (
                  <tr key={cid} className={cid === results.winnerId ? 'winner' : ''}>
                    <td className="border px-4 py-2">{cid}</td>
                    <td className="border px-4 py-2">{results.names[idx]}</td>
                    <td className="border px-4 py-2">{results.votes[idx]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-sm text-primary">Winner: {results.winnerId} {results.names[results.ids.indexOf(results.winnerId)]}</div>
          </div>
        </div>
      )}

      {!loading && !results && (
        <div className="text-gray-500">Select an election to view results.</div>
      )}
    </div>
  );
}
