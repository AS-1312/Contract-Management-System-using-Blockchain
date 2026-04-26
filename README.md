# Contract Management System using Blockchain

A decentralized system for contract life-cycle management built with Solidity, Truffle, React, and Ethers.js. Contracts go through a multi-party approval workflow — from initiation to approval, validation, expiry, and renewal — all recorded on-chain.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Guide (Step by Step)](#setup-guide-step-by-step)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Smart Contract Dependencies (+ Ganache)](#2-install-smart-contract-dependencies--ganache)
  - [3. Start the Local Blockchain (Ganache)](#3-start-the-local-blockchain-ganache)
  - [4. Create the Secret File](#4-create-the-secret-file)
  - [5. Compile and Deploy Smart Contracts](#5-compile-and-deploy-smart-contracts)
  - [6. Update Frontend with Deployed Addresses](#6-update-frontend-with-deployed-addresses)
  - [7. Copy ABIs to Frontend](#7-copy-abis-to-frontend)
  - [8. Install Frontend Dependencies](#8-install-frontend-dependencies)
  - [9. Start the Frontend](#9-start-the-frontend)
- [MetaMask Configuration](#metamask-configuration)
  - [Add Ganache Network](#add-ganache-network)
  - [Import Ganache Accounts](#import-ganache-accounts)
- [Using the Application](#using-the-application)
- [Contract Lifecycle Stages](#contract-lifecycle-stages)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have the following installed on your system:

| Tool | Version | How to Install |
|------|---------|----------------|
| **Node.js** | v16 – v20 recommended | [nodejs.org](https://nodejs.org/) or `brew install node` |
| **npm** | Comes with Node.js | Included with Node.js |
| **MetaMask** | Latest browser extension | [metamask.io](https://metamask.io/) |
| **Git** | Any recent version | `brew install git` or [git-scm.com](https://git-scm.com/) |

> **Note:** Node.js v25+ also works but v18 LTS is the safest bet for compatibility.

---

## Project Structure

```
Contract-Management-System-using-Blockchain/
├── truffle/                    # Smart contracts & deployment
│   ├── contracts/              # Solidity source files
│   │   ├── ContractController.sol
│   │   ├── ContractFactory.sol
│   │   ├── ContractStages.sol
│   │   ├── interfaces/
│   │   └── token/
│   ├── migrations/             # Deployment scripts
│   ├── build/contracts/        # Compiled ABIs (generated after compile)
│   ├── truffle-config.js
│   └── package.json            # Has ganache as devDependency
│
├── cmsb-frontend/              # React frontend
│   ├── src/
│   │   ├── abis/               # ABI JSON files (copied from truffle/build)
│   │   ├── components/
│   │   │   ├── Contract.js     # Individual contract view
│   │   │   ├── Contracts.js    # Contract list
│   │   │   ├── Initiate.js     # Create new contract
│   │   │   └── utils/
│   │   │       └── methods.js  # Blockchain interaction methods
│   │   ├── App.js
│   │   └── index.css
│   ├── config-overrides.js     # Webpack polyfills for web3
│   └── package.json
│
└── README.md
```

---

## Setup Guide (Step by Step)

### 1. Clone the Repository

```bash
git clone https://github.com/UltimateRoman/Contract-Management-System-using-Blockchain.git
cd Contract-Management-System-using-Blockchain
```

---

### 2. Install Smart Contract Dependencies (+ Ganache)

Ganache is included as a **local dev dependency** in the `truffle/` folder — no global install needed.

```bash
cd truffle
npm install
```

This installs:
- **Truffle** — Smart contract development framework
- **Ganache** — Local Ethereum blockchain (installed locally via `devDependencies`)
- **OpenZeppelin** — Secure smart contract libraries
- **HDWalletProvider** — For deploying to testnets (optional)

> **Why local Ganache?** Installing Ganache as a project dependency (`npm install`) means every contributor gets the exact same version without polluting their global environment. It runs via `npx ganache` from within the `truffle/` folder.

---

### 3. Start the Local Blockchain (Ganache)

Open a **new terminal** (keep this running throughout development):

```bash
cd truffle
npx ganache --chain.chainId 1337 --server.port 8545
```

You should see output like:
```
ganache v7.x.x
...
Available Accounts
==================
(0) 0xXXXX... (1000 ETH)
(1) 0xXXXX... (1000 ETH)
...

Private Keys
==================
(0) 0xabcd...
(1) 0xefgh...
...

RPC Listening on 127.0.0.1:8545
```

> **Important:** Copy the **Private Keys** for at least 2 accounts — you'll need them for MetaMask later.

> **Tip:** You can also set a fixed mnemonic for consistent addresses across restarts:
> ```bash
> npx ganache --chain.chainId 1337 --server.port 8545 --wallet.mnemonic "your twelve word mnemonic phrase here"
> ```

---

### 4. Create the Secret File

The `.secret` file is gitignored for security. You need to create it manually:

```bash
cd truffle
echo "any twelve word mnemonic phrase that you want to use here" > .secret
```

For **local development only**, you can use the mnemonic that Ganache printed when it started, or any dummy phrase. This file is only needed for testnet deployments — Ganache doesn't require it.

---

### 5. Compile and Deploy Smart Contracts

In a **second terminal** (while Ganache is still running in the first):

```bash
cd truffle
npx truffle compile
npx truffle migrate --reset --network development
```

After successful deployment, you'll see output like:
```
2_deploy_contracts.js
=====================

   Replacing 'DAI'
   ---------------
   > contract address:    0x1234...    <-- COPY THIS (DAI address)

   Replacing 'ContractFactory'
   ---------------------------
   > contract address:    0x5678...    <-- COPY THIS (Factory address)
```

**Save both addresses** — you need them in the next step.

---

### 6. Update Frontend with Deployed Addresses

Open `cmsb-frontend/src/components/utils/methods.js` and update these two lines at the top with your deployed addresses:

```javascript
const daiContractAddress = "0x1234...";       // <-- Your DAI address from step 5
const factoryContractAddress = "0x5678...";   // <-- Your Factory address from step 5
```

---

### 7. Copy ABIs to Frontend

The compiled contract ABIs need to be in the frontend's `abis/` folder:

```bash
# From the project root directory
cp truffle/build/contracts/ContractController.json cmsb-frontend/src/abis/ContractController.json
cp truffle/build/contracts/ContractFactory.json cmsb-frontend/src/abis/ContractFactory.json
cp truffle/build/contracts/DAI.json cmsb-frontend/src/abis/DAI.json
cp truffle/build/contracts/ContractStages.json cmsb-frontend/src/abis/ContractStages.json
```

---

### 8. Install Frontend Dependencies

```bash
cd cmsb-frontend
npm install
```

---

### 9. Start the Frontend

```bash
cd cmsb-frontend
npm start
```

The app will open at **http://localhost:3000**

---

## MetaMask Configuration

### Add Ganache Network

1. Open MetaMask → Click the network selector at the top → **Add Network** → **Add a network manually**
2. Fill in:

| Field | Value |
|-------|-------|
| Network Name | `Ganache Local` |
| New RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `1337` |
| Currency Symbol | `ETH` |

3. Click **Save** and switch to this network.

### Import Ganache Accounts

You need **at least 2 accounts** to test the multi-party contract workflow:

1. In MetaMask → Click your account icon → **Import Account**
2. Select **Private Key**
3. Paste the private key of **Account (0)** from Ganache's startup output
4. Repeat for **Account (1)** (this will be the second party)

> **Tip:** Name them something like "Ganache - Party A" and "Ganache - Party B" so you can easily switch between them.

---

## Using the Application

### Creating a Contract

1. Make sure MetaMask is on the **Ganache Local** network
2. Connect your wallet on the app (Party A)
3. Go to **Initiate Contract**
4. Fill in the contract details:
   - Contract name
   - Second party address (paste Account 1's address from Ganache)
   - Expiration date
   - Upload a document (uses IPFS)
   - Optionally add payment in DAI
5. Submit — MetaMask will ask you to confirm the transaction

### Contract Approval Flow

| Step | Who | Action |
|------|-----|--------|
| 1 | Party B | Switch to Account 1 in MetaMask → Go to the contract → **Sign & Approve** |
| 2 | Party A | Switch back to Account 0 → **Sign & Validate Contract** |
| 3 | — | Contract is now **Active** with a countdown timer |

### Contract Renewal (Two-Party Signing)

When a contract expires:

| Step | Who | Action |
|------|-----|--------|
| 1 | Either party | Click **Mark as Expired** to update the on-chain status |
| 2 | Party A (Initiator) | Select a new expiry date → Click **Propose Renewal** |
| 3 | Party B | Switch to Account 1 → Review the proposed date → **Sign & Approve Renewal** |
| 4 | — | Contract is now **Active** again with the new expiry date |

---

## Contract Lifecycle Stages

```
┌──────────────────────┐
│  0: Pending Approval │  ← All parties must sign
└──────┬───────────────┘
       │ (all approved)
       ▼
┌──────────────────────┐
│ 1: Pending Validation│  ← Initiator validates
└──────┬───────────────┘
       │ (validated)
       ▼
┌──────────────────────┐
│    2: Active         │  ← Live countdown timer
│    (Validated)       │
└──────┬───────────────┘
       │ (expired)
       ▼
┌──────────────────────┐     ┌──────────────────────┐
│    3: Expired        │────►│ 4: Renewal Pending   │
│                      │     │ (awaiting signatures)│
└──────────────────────┘     └──────┬───────────────┘
                                    │ (all approved)
                                    ▼
                             Back to Stage 2 (Active)

At Stage 0, any party can:
  ──► 5: Rejected
```

---

## Troubleshooting

### "MetaMask - Nonce too high" error
When you restart Ganache, MetaMask's cached nonces become stale.
**Fix:** MetaMask → Settings → Advanced → **Clear Activity Tab Data**

### "Transaction failed" on contract interaction
- Make sure Ganache is running on port `8545`
- Make sure the contract addresses in `methods.js` match your deployment
- Make sure the ABIs in `cmsb-frontend/src/abis/` are up to date

### Frontend shows blank page or crashes
- Check the browser console (F12) for errors
- Make sure you ran `npm install` in the `cmsb-frontend` folder
- Verify MetaMask is on the **Ganache Local** network (Chain ID 1337)

### Ganache command not found
Ganache is installed locally in `truffle/node_modules`. Always use `npx ganache` from inside the `truffle/` folder, not just `ganache`.

### Contracts compile but migration fails
- Make sure Ganache is running before you run `truffle migrate`
- Check that `truffle-config.js` has the correct port (`8545`)
- Try `npx truffle migrate --reset --network development`

---

## Testnet Deployments (Optional)

The project can also be deployed to public testnets. Update `truffle/.secret` with a real mnemonic that has testnet funds:

| Network | Command | Faucet |
|---------|---------|--------|
| Sepolia | `npx truffle migrate --network sepolia` | [sepoliafaucet.com](https://sepoliafaucet.com/) |
| Polygon Amoy | `npx truffle migrate --network amoy` | [faucet.polygon.technology](https://faucet.polygon.technology/) |

After deploying to a testnet, update the contract addresses in `methods.js` and switch MetaMask to the corresponding network.

---

## License

MIT
