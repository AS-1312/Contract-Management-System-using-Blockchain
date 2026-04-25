import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Home from './components/Home';
import Navigation from './components/Navigation';
import Initiate from './components/Initiate';
import Contracts from './components/Contracts';
import Contract from './components/Contract';

import {
  loadProviderAndBlockchainData,
  getDAIBalance,
  initiateNewContract,
  getMyContracts,
  getContractDetails,
  approveContract,
  rejectContract,
  validateContract,
  renewContract,
  checkExpired
} from './components/utils/methods';
import useMetaMask from './hooks/metamask';

function App() {

  const {
    isActive,
    account,
    isLoading,
    connect,
    disconnect,
    library
  } = useMetaMask();

  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    await connect();
    if (isActive || typeof window.ethereum !== 'undefined') {
      if (library !== undefined) {
        const networkId = await library.eth.net.getId();
        // Supported: Mumbai(80001), Amoy(80002), Sepolia(11155111), Local Ganache(1337+)
        const supportedNetworks = [80001, 80002, 11155111, 1337];
        if (supportedNetworks.includes(networkId) || networkId > 1000000000000) {
          await loadProviderAndBlockchainData();
        } else {
          window.alert("Please switch to a supported network: Polygon Amoy, Sepolia, or Localhost");
        }
      }
    } else {
      window.alert("Metamask wallet not detected. Please install the extension wallet");
    }
  };

  const handleChange = async (event) => {
    console.log(event)
    await connectWallet();
  }

  useEffect(() => {
    setLoading(true);
    window.addEventListener('Web3ReactUpdate', handleChange);

    async function fetchData() {
      await connectWallet();
    }

    fetchData();
    setLoading(false);

    return () => {
      window.removeEventListener('Web3ReactUpdate', handleChange);
    };
  }, []);

  if (loading || isLoading) {
    return (
      <div className="gh-loading">
        <div className="gh-spinner"></div>
        <span className="gh-text-muted">Connecting to blockchain...</span>
      </div>
    );
  } else {
    return (
      <React.Fragment>
        {isActive !== true ?
          <React.Fragment>
            <Navigation
              isActive={isActive}
              account={account}
              connectWallet={connectWallet}
              disconnectWallet={disconnect}
            />
            <Home />
          </React.Fragment>
          :
          <React.Fragment>
            <BrowserRouter>
              <Navigation
                isActive={isActive}
                account={account}
                connectWallet={connectWallet}
                disconnectWallet={disconnect}
              />
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/initiation">
                  <Initiate
                    account={account}
                    setLoading={setLoading}
                    getDAIBalance={getDAIBalance}
                    initiateNewContract={initiateNewContract}
                  />
                </Route>
                <Route exact path="/contracts">
                  <Contracts
                    account={account}
                    setLoading={setLoading}
                    getMyContracts={getMyContracts}
                  />
                </Route>
                <Route exact path="/contract/:id">
                  <Contract
                    account={account}
                    setLoading={setLoading}
                    getMyContracts={getMyContracts}
                    getContractDetails={getContractDetails}
                    approveContract={approveContract}
                    rejectContract={rejectContract}
                    validateContract={validateContract}
                    renewContract={renewContract}
                    checkExpired={checkExpired}
                  />
                </Route>
              </Switch>
            </BrowserRouter>
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

export default App;