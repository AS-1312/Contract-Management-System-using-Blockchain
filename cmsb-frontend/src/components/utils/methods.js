import { ethers, Contract, providers } from 'ethers';
import DAI from '../../abis/DAI.json';
import ContractFactory from '../../abis/ContractFactory.json';
import ContractController from '../../abis/ContractController.json';

const daiContractAddress = "0x61A344cC7c8a6c64e3446cE9Fb02afE6b027aB84";
const factoryContractAddress = "0xF2D791Fa1EE5eF61Da67860cdE3e8E19eb4E9950";

let signer, provider, factoryContract, daiContract;

export const loadProviderAndBlockchainData = async () => {
    provider = new providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    daiContract = new Contract(daiContractAddress, DAI.abi, provider);
    factoryContract = new Contract(factoryContractAddress, ContractFactory.abi, provider);
};

export const getDAIBalance = async () => {
    await loadProviderAndBlockchainData();
    const balance = await daiContract.connect(signer).balanceOf(await signer.getAddress());
    return ethers.utils.formatEther(balance);
};

export const initiateNewContract = async (contractData) => {
    await loadProviderAndBlockchainData();
    if (contractData.isPayable) {
        try {
            const tx = await daiContract.connect(signer).approve(factoryContract.address, ethers.utils.parseEther(contractData.fundDistribution.reduce((a, b) => a + b)));
            await tx.wait();
            window.alert("Approval successful, please wait for next transaction");
        } catch(error) {
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
    } catch(error) {
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
    } catch(error) {
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
    } catch(error) {
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
    } catch(error) {
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
    } catch(error) {
        if (error.code === 4001) {
            window.alert("Transaction was rejected by the user");
        } else {
            window.alert("Transaction failed");
            console.log(error)
        }
        return false;
    }
};