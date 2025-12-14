import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ResultsPage from './pages/Results';

function Home() {
  return (
    <div className="container">
      <div className="p-6 card-hover gradient-border bg-card">
        <h2 className="text-3xl font-bold mb-4">Welcome to the Voting DApp</h2>
        <p className="mb-4">View election results or cast your vote using the Vote page.</p>
        <a href="/results" className="cosmic-button">See Results</a>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/results" element={<ResultsPage/>} />
        </Routes>
      </div>
    </div>
  )
}
