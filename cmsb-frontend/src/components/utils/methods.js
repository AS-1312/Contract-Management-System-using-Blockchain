import { ethers, Contract, providers } from 'ethers';
import DAI from '../../abis/DAI.json';
import ContractFactory from '../../abis/ContractFactory.json';
import ContractController from '../../abis/ContractController.json';

const daiContractAddress = "0xcA7d700F3aB993d689a41Cf0b7747B5D2aDF008f";
const factoryContractAddress = "0xFE02C7703710D5720415efc8176c6CaC48113151";

// Supported RPCs
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const LOCAL_RPC = "http://127.0.0.1:8545";

let signer, provider, factoryContract, daiContract, readProvider;
let isInitialized = false;
let currentAccount = null;

export const loadProviderAndBlockchainData = async () => {
    // Always create a fresh provider to read the current account
    const freshProvider = new providers.Web3Provider(window.ethereum);
    const freshSigner = freshProvider.getSigner();
    const freshAccount = await freshSigner.getAddress();

    // Re-initialise if not yet initialised OR if the MetaMask account changed
    if (isInitialized && signer && provider && currentAccount === freshAccount.toLowerCase()) return;

    provider = freshProvider;
    const network = await provider.getNetwork();
    signer = freshSigner;
    currentAccount = freshAccount.toLowerCase();

    // Use local RPC if on Ganache, otherwise use Sepolia public RPC
    const rpcUrl = (network.chainId === 1337 || network.chainId === 5777) ? LOCAL_RPC : SEPOLIA_RPC;
    readProvider = new providers.JsonRpcProvider(rpcUrl);

    // Initialise contracts with the injected provider (MetaMask)
    daiContract = new Contract(daiContractAddress, DAI.abi, provider);
    factoryContract = new Contract(factoryContractAddress, ContractFactory.abi, provider);
    isInitialized = true;
};

export const getDAIBalance = async () => {
    await loadProviderAndBlockchainData();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    // Dynamically get address from ABI for the current network
    const networkAddress = DAI.networks[network.chainId]?.address || daiContractAddress;

    // Use the independent read-only provider to avoid MetaMask RPC rate limits
    const readDai = new Contract(networkAddress, DAI.abi, readProvider);
    const balance = await readDai.balanceOf(address);
    return ethers.utils.formatEther(balance);
};

export const initiateNewContract = async (contractData) => {
    await loadProviderAndBlockchainData();
    if (contractData.isPayable) {
        try {
            const tx = await daiContract.connect(signer).approve(factoryContract.address, ethers.utils.parseEther(contractData.fundDistribution.reduce((a, b) => a + b)));
            await tx.wait();
            window.alert("Approval successful, please wait for next transaction");
        } catch (error) {
            console.log(error)
            window.alert("Approval failed");
            return false;
        }
        contractData.fundDistribution.forEach((fund, id) => {
            contractData.fundDistribution[id] = ethers.utils.parseEther(fund);
        });
    }
    try {
        const tx = await factoryContract.connect(signer).initiateContract(contractData);
        await tx.wait();
        window.alert("Transaction was successful, contract created");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
        }
        return false;
    }
};

export const getMyContracts = async () => {
    await loadProviderAndBlockchainData();
    const contracts = await factoryContract.connect(signer).getMyContracts();
    if (contracts) {
        return contracts;
    } else {
        return [];
    }
};

export const getContractDetails = async (contractAddress) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    const contractStage = await contractController.connect(signer).getContractStage();
    const contractData = await contractController.connect(signer).viewContractData();
    const currentPartyApproved = await contractController.connect(signer).hasCurrentPartyApproved();
    const fullContractDetails = {
        'stage': contractStage.toString(),
        'data': contractData,
        'currentApproved': currentPartyApproved
    };

    // If in RenewalPending stage (4), fetch renewal-specific data
    if (contractStage.toString() === '4') {
        const proposedExpiry = await contractController.connect(signer).getProposedExpiryTime();
        const renewalApproved = await contractController.connect(signer).hasCurrentPartyApprovedRenewal();
        fullContractDetails.proposedExpiryTime = proposedExpiry.toString();
        fullContractDetails.currentRenewalApproved = renewalApproved;
    }

    return fullContractDetails;
};

export const approveContract = async (contractAddress) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).approveContract();
        await tx.wait();
        window.alert("Transaction was successful, contract approved");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
        }
        return false;
    }
};

export const rejectContract = async (contractAddress) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).rejectContract();
        await tx.wait();
        window.alert("Transaction was successful, contract rejected");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
        }
        return false;
    }
};

export const validateContract = async (contractAddress) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).finalApproval();
        await tx.wait();
        window.alert("Transaction was successful, contract has been validated");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
        }
        return false;
    }
};

export const proposeRenewal = async (contractAddress, expiryTime) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).proposeRenewal(expiryTime);
        await tx.wait();
        window.alert("Renewal proposed successfully. Waiting for all parties to approve.");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
            console.log(error);
        }
        return false;
    }
};

export const approveRenewal = async (contractAddress) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).approveRenewal();
        await tx.wait();
        window.alert("Renewal approved successfully");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
            console.log(error);
        }
        return false;
    }
};

export const checkExpired = async (contractAddress) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).checkExpired();
        await tx.wait();
        return true;
    } catch (error) {
        console.log("checkExpired error:", error);
        return false;
    }
};