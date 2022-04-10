import { ethers, Contract, providers } from 'ethers';
import DAI from '../../abis/DAI.json';
import ContractFactory from '../../abis/ContractFactory.json';
import ContractController from '../../abis/ContractController.json';

const daiContractAddress = "0x08204434B07864Ada34D43AfF77A2551A17658b2";
const factoryContractAddress = "0x917c2Ac0F30c62C1CB599D8AaB8B58f5C7242363";

let signer, provider, factoryContract, daiContract;

export const loadProviderAndBlockchainData = async () => {
    provider = new providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    daiContract = new Contract(daiContractAddress, DAI.abi, provider);
    factoryContract = new Contract(factoryContractAddress, ContractFactory.abi, provider);
};

export const initiateNewContract = async (contractData) => {
    loadProviderAndBlockchainData();
    if (contractData.isPayable) {
        try {
            const tx = await daiContract.connect(signer).approve(factoryContract.address, ethers.utils.parseEther(contractData.fundDistribution.reduce((a, b) => a + b)));
            await tx.wait();
            window.alert("Transaction successfull");
        } catch(error) {
            window.alert("Transaction failed");
        }
    }
    try {
        const tx = await factoryContract.connect(signer).initiateContract(contractData);
        await tx.wait();
        window.alert("Transaction successfull");
    } catch(error) {
        window.alert("Transaction failed");
    }
};

export const getMyContracts = async () => {
    loadProviderAndBlockchainData();
    const contracts = await factoryContract.connect(signer).getMyContracts();
    if (contracts) {
        return contracts;
    } else {
        return [];
    }
};

export const getContractDetails = async (contractAddress) => {
    loadProviderAndBlockchainData();
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