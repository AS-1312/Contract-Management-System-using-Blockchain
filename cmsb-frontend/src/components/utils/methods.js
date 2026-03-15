import { ethers, Contract, providers } from 'ethers';
import DAI from '../../abis/DAI.json';
import ContractFactory from '../../abis/ContractFactory.json';
import ContractController from '../../abis/ContractController.json';

const daiContractAddress = "0xcfc0Fa4b955caac260975e3B4F6D7729c64c235f";
const factoryContractAddress = "0xC35f2f32d341Df2deD161CB0dA14FdbBc10F5Ec2";

// Supported RPCs
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const LOCAL_RPC = "http://127.0.0.1:8545";

let signer, provider, factoryContract, daiContract, readProvider;
let isInitialized = false;

export const loadProviderAndBlockchainData = async () => {
    if (isInitialized && signer && provider) return;
    provider = new providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    signer = provider.getSigner();

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

export const renewContract = async (contractAddress, expiryTime) => {
    await loadProviderAndBlockchainData();
    const contractController = new Contract(contractAddress, ContractController.abi, provider);
    try {
        const tx = await contractController.connect(signer).renewContract(expiryTime);
        await tx.wait();
        window.alert("Transaction was successful, contract has been renewed");
        return true;
    } catch (error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
            console.log(error)
        }
        return false;
    }
};