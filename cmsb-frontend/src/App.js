import './App.css';
import useMetaMask from './hooks/metamask';
import { ethers, Contract, providers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Home from './components/Home';
import Navigation from './components/Navigation';
import Create from './components/Create';
import DAI from './abis/DAI.json';
import ContractFactory from './abis/ContractFactory.json';

function App() {

  const { connect, disconnect, isActive, account, library } = useMetaMask();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [dai, setDaiContract] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);

  const connectWallet = async () => {
    await connect();
    if (isActive) {
      if (await library.eth.net.getId() === 80001) {
        const provider = new providers.Web3Provider(library.eth.net.currentProvider);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);
        await loadBlockchainData();
      } else {
        window.alert("Please change the network to Mumbai Test Network");
      }
    } else {
      window.alert("Metamask wallet not detected. Please install the extension wallet");
    }
  }

  const loadBlockchainData = async () => {
    const daiContract = new Contract("0x0CC77CC2f9a4ae5023cEa08c93a12C2603af562e", DAI.abi, provider);
    setDaiContract(daiContract);
    const factoryContract = new Contract("0xD608276690AAC72E18B733579E4Cb880E47DF61e", ContractFactory.abi, provider);
    setFactoryContract(factoryContract);
  }

  const initiateNewContract = async (contractData) => {
    const tx = await factoryContract.initiateContract(contractData);
    const receipt = await tx.wait();
  }

  const getMyContracts = async () => {
    const contracts = await factoryContract.getMyContracts();
    return contracts;
  }

  const handleChange = async(event) => {
    console.log(event)
    connectWallet();
  }

  useEffect(() => {
    window.addEventListener('Web3ReactUpdate', handleChange);

    return () => {
      window.removeEventListener('Web3ReactUpdate', handleChange);
    };
  }, [isActive]);

  return (
    <React.Fragment>
      <BrowserRouter>
        <Navigation 
          isActive={isActive}
          account={account}
          connectWallet={connectWallet}
        />
          <Switch>
          <Route exact path="/">
            <Home 
              connectWallet={connectWallet}
              isActive={isActive}
              account={account}
              disconnect={disconnect}
            />
          </Route>
          <Route exact path="/create">
            <Create 
              account={account}
              initiateNewContract={initiateNewContract}
            />
          </Route>
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
