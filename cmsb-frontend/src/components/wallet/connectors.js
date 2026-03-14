import { InjectedConnector } from '@web3-react/injected-connector';

// Supported Chain IDs:
// 1337 / any    = Local Ganache
// 80002         = Polygon Amoy Testnet
// 11155111      = Ethereum Sepolia Testnet
// 80001         = Polygon Mumbai (deprecated)
export const injected = new InjectedConnector({
    supportedChainIds: [1337, 80001, 80002, 11155111]
});