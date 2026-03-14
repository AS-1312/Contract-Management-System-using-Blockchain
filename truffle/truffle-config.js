const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    // ---- Local Development (Ganache) ----
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },

    // ---- Polygon Amoy Testnet (Mumbai successor) ----
    // Faucet: https://faucet.polygon.technology/
    // Explorer: https://amoy.polygonscan.com/
    amoy: {
      provider: () => new HDWalletProvider(
        mnemonic,
        "https://rpc-amoy.polygon.technology/"  // Free public RPC
        // Or use Alchemy: "https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY"
      ),
      network_id: 80002,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 30000000000  // 30 gwei
    },

    // ---- Ethereum Sepolia Testnet ----
    // Faucet: https://sepoliafaucet.com/ or https://www.alchemy.com/faucets/ethereum-sepolia
    // Explorer: https://sepolia.etherscan.io/
    sepolia: {
      provider: () => new HDWalletProvider(
        mnemonic,
        "https://ethereum-sepolia-rpc.publicnode.com"  // Alternative active public RPC
      ),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 1000000, // Increase timeout to handle slow public RPCs
      pollingInterval: 15000
    },

    // ---- OLD: Polygon Mumbai (DEPRECATED - DO NOT USE) ----
    // mumbai: {
    //   provider: () => new HDWalletProvider(mnemonic, "https://polygon-mumbai.g.alchemy.com/v2/..."),
    //   network_id: 80001,
    // }
  },

  compilers: {
    solc: {
      version: "0.8.2",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}