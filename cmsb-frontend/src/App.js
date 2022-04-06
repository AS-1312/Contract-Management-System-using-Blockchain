import logo from './logo.svg';
import './App.css';
import { Button } from 'react-bootstrap';
import useMetaMask from './hooks/metamask';
import { Contract, providers } from 'ethers';

function App() {

  const { connect, disconnect, isActive, account, library } = useMetaMask();

  const nconnect = async () => {
    console.log(library.provider)
    const provider = new providers.Web3Provider(library.provider);
    console.log(provider)
    connect();
  }

  return (
    <div className="App">
      <header className="App-header">
        <Button variant="secondary" onClick={nconnect}>
          <img src={logo} alt="metamask" width="50" height="50" /> Connect to MetaMask
        </Button>
        <div className="mt-2 mb-2">
          Connected Account: { isActive ? account : '' }
        </div>
        <Button variant="danger" onClick={disconnect}>
          Disconnect MetaMask
        </Button>
      </header>
    </div>
  );
}

export default App;
