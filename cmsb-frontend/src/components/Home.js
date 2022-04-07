import React from 'react';
import { Button } from 'react-bootstrap';

function Home(props) {
    return(
        <div className="App">
        <header className="App-header">
            <h1>Contract Management System using Blockchain</h1>
            <Button variant="secondary" onClick={props.connectWallet}>
            Connect to MetaMask
            </Button>
            <div className="mt-2 mb-2">
            Connected Account: { props.isActive ? props.account : '' }
            </div>
            <Button variant="danger" onClick={props.disconnect}>
            Disconnect MetaMask
            </Button>
        </header>
        </div>
    );
}

export default Home;