import { ethers, Contract, providers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";

import Home from './components/Home';
import Navigation from './components/Navigation';
import Initiate from './components/Initiate';
import Contracts from './components/Contracts';

import DAI from './abis/DAI.json';
import ContractFactory from './abis/ContractFactory.json';

import { HalfCircleSpinner } from 'react-epic-spinners';
import useMetaMask from './hooks/metamask';

function App() {

  const { 
    isActive,
    account,
    isLoading,
    connect,
    disconnect,
    shouldDisable,
    library 
  } = useMetaMask();

  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [daiContract, setDaiContract] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);

  const connectWallet = async () => {
    await connect();
    if (isActive || typeof window.ethereum !== 'undefined') {
      if (library !== undefined) {
        if (await library.eth.net.getId() === 80001) {
          const provider = new providers.Web3Provider(library.eth.net.currentProvider);
          const signer = provider.getSigner();
          setProvider(provider);
          setSigner(signer);
          await loadBlockchainData();
        } else {
          window.alert("Please change the network to Mumbai Test Network");
        }
      }
    } else {
      window.alert("Metamask wallet not detected. Please install the extension wallet");
    }
  };

  const loadBlockchainData = async () => {
    const daiContract = new Contract("0x0CC77CC2f9a4ae5023cEa08c93a12C2603af562e", DAI.abi, provider);
    setDaiContract(daiContract);
    const factoryContract = new Contract("0xD608276690AAC72E18B733579E4Cb880E47DF61e", ContractFactory.abi, provider);
    setFactoryContract(factoryContract);
  }

  const initiateNewContract = async (contractData) => {
    const tx = await factoryContract.initiateContract(contractData);
    const receipt = await tx.wait();
    console.log(receipt);
  }

  const getMyContracts = async () => {
    const contracts = await factoryContract.getMyContracts();
    return contracts;
  }

  const handleChange = async (event) => {
    console.log(event)
    connectWallet();
  }

  useEffect(() => {
    setLoading(true);
    window.addEventListener('Web3ReactUpdate', handleChange);
    
    async function fetchData() {
      if (isActive) {
        connectWallet();
      }
    }

    fetchData();
    setLoading(false);

    return () => {
      window.removeEventListener('Web3ReactUpdate', handleChange);
    };
  }, [isActive]);

  if (loading || isLoading) {
    return(
      <div  class="flex flex-row min-h-screen justify-center items-center">
        <HalfCircleSpinner size="100" color="blue" />
      </div>
    );
  } else {
    return (
      <React.Fragment>
        { isActive !== true ?
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
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/initiate">
                <Initiate 
                  account={account}
                  initiateNewContract={initiateNewContract}
                />
              </Route>
              <Route exact path="/contracts">
                <Contracts 
                  account={account}
                  getMyContracts={getMyContracts}
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