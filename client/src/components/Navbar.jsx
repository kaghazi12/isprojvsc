import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar(){
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metamaskAvailable, setMetamaskAvailable] = useState(false);

  useEffect(() => {
    // Check if MetaMask is available and load saved account
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log('MetaMask detected');
        setMetamaskAvailable(true);
        
        // Try to get the saved account from localStorage
        const savedAccount = localStorage.getItem('connectedAccount');
        console.log('Checking localStorage for account:', savedAccount);
        if (savedAccount) {
          setAccount(savedAccount);
          console.log('Loaded saved account:', savedAccount);
        } else {
          console.log('No saved account found, clearing state');
          setAccount(null);
        }
      } else {
        console.log('MetaMask not detected');
        setMetamaskAvailable(false);
      }
    };

    checkMetaMask();
    
    // Also listen for MetaMask becoming available
    window.addEventListener('ethereum#initialized', checkMetaMask);
    return () => window.removeEventListener('ethereum#initialized', checkMetaMask);
  }, []);

  const connectWallet = async () => {
    console.log('Connect wallet clicked');
    console.log('window.ethereum:', window.ethereum);
    
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it from https://metamask.io');
      return;
    }

    try {
      setLoading(true);
      console.log('Requesting accounts...');
      // Request account access - this triggers the MetaMask popup
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts received:', accounts);
      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);
        // Save to localStorage so it persists on page refresh
        localStorage.setItem('connectedAccount', selectedAccount);
        console.log('Account saved to localStorage:', selectedAccount);
        // Refresh the page after connecting
        setTimeout(() => {
          console.log('Reloading page after wallet connection...');
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        console.log('User rejected the connection request');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const disconnectWallet = async () => {
    console.log('Disconnect wallet clicked');
    
    // Clear the account from state
    setAccount(null);
    
    // Remove from localStorage
    localStorage.removeItem('connectedAccount');
    console.log('Account cleared from app state and localStorage');
    
    // Revoke permissions from MetaMask to fully disconnect
    if (window.ethereum) {
      try {
        console.log('Attempting to revoke MetaMask permissions...');
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [
            {
              eth_accounts: {}
            }
          ]
        });
        console.log('MetaMask permissions revoked successfully');
      } catch (error) {
        console.error('Error revoking permissions:', error);
        // Even if revoke fails, the app is still disconnected
      }
    }
    
    // Refresh the page after disconnecting
    setTimeout(() => {
      console.log('Reloading page after wallet disconnection...');
      window.location.reload();
    }, 500);
  };

  const switchWallet = async () => {
    console.log('Switch wallet clicked');
    
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it from https://metamask.io');
      return;
    }

    try {
      setLoading(true);
      
      // Request new accounts (opens MetaMask for user to select a different account)
      console.log('Requesting accounts to switch wallet...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts received:', accounts);
      
      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        console.log('User selected account:', selectedAccount);
        
        // Check if it's a different account
        if (selectedAccount.toLowerCase() !== account.toLowerCase()) {
          console.log('Different account selected, updating...');
          setAccount(selectedAccount);
          localStorage.setItem('connectedAccount', selectedAccount);
          console.log('New account saved to localStorage:', selectedAccount);
          
          // Refresh the page after successful switch
          setTimeout(() => {
            console.log('Reloading page after wallet switch...');
            window.location.reload();
          }, 500);
        } else {
          console.log('Same account selected, no change needed');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      if (error.code === 4001) {
        console.log('User cancelled the wallet switch - keeping current wallet connected');
        // User cancelled - keep the current wallet connected
      }
      setLoading(false);
    }
  };

  return (
    <nav className="bg-card p-4 shadow-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-primary">Voting DApp</Link>
          <Link to="/vote" className="text-sm hover:text-primary">Vote</Link>
          <Link to="/results" className="text-sm hover:text-primary">Results</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {account ? (
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-primary text-foreground rounded-lg">
                {formatAddress(account)}
              </div>
              <button
                onClick={() => {
                  console.log('Disconnect clicked');
                  disconnectWallet();
                }}
                className="text-background font-semibold text-sm px-3 py-2 rounded bg-red-500 hover:bg-red-600 "
                type="button"
                title="Disconnect wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                console.log('Connect Wallet clicked');
                connectWallet();
              }}
              disabled={loading || !metamaskAvailable}
              className="cosmic-button"
              type="button"
              title={!metamaskAvailable ? "MetaMask not detected" : "Click to connect wallet"}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
