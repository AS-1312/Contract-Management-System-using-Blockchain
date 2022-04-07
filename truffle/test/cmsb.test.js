const DAI  = artifacts.require("DAI");
const ContractFactory = artifacts.require("ContractFactory");
const ContractController = require("../build/contracts/ContractController.json");
const ContractController1 = artifacts.require("ContractController");
const ContractStages = artifacts.require("ContractStages")


contract("CMSB Contracts Test", (accounts) => {
    let contractFactory, baseContract, dai, contractMain, contractStages;

    before(async () => {
        dai = await DAI.deployed();
        contractFactory = await ContractFactory.deployed();
        baseContract = await contractFactory.baseContract();
        contractController = await ContractController1.deployed();
        contractStages = await ContractStages.deployed()

        for (let i=0; i<5; ++i) {
            await dai.mint(accounts[i], web3.utils.toWei("100"));
        }
    });

    describe("Smart contract deployment", async () => {
        it("Factory contract deploys succesfully", async () => {
            const address = await contractFactory.address;
            assert.isDefined(address);    
            assert.notEqual(address, "0x0000000000000000000000000000000000000000");    
            assert.isDefined(baseContract);    
            assert.notEqual(baseContract, "0x0000000000000000000000000000000000000000");
        });
    });

    describe("Contract Initiation", async () => {
        let contractMain;

        it("initiating party can create a new contract", async () => {
            let contractData = {
                isPayable: false,
                expiryTime: 0,
                fundDistribution: [0],
                initiatingParty: accounts[1],
                parties: [accounts[2], accounts[3]],
                contractName: "Sample contract",
                document:"https://sampleuri.ipfs.io"
            };
            
            await contractFactory.initiateContract(contractData, {from: accounts[1]});
        });

        it("contract list count is incremented", async () => {
            let contractCount = await contractFactory.getContractsCount();
            assert.equal(contractCount, 1);
        });

        it("contract data can be correctly retrieved", async () => {
            let baseContractData = await contractFactory.contractsList(0);

            contractMain = new web3.eth.Contract(ContractController.abi, baseContractData.contractAddress);
            const completeContractData = await contractMain.methods.viewContractData().call({from: accounts[1]});
            
            assert.equal(completeContractData.isPayable, false);
            assert.equal(completeContractData.expiryTime, 2000000);
            assert.equal(completeContractData.initiatingParty, accounts[1]);
            assert.equal(completeContractData.parties[0], accounts[2]);
            assert.equal(completeContractData.parties[1], accounts[3]);
            assert.equal(completeContractData.contractName, 'Sample contract');
            assert.equal(completeContractData.document, 'https://sampleuri.ipfs.io');
        });

        it("list of contracts of a user can be retrieved", async () => {
            let contractData = {
                isPayable: false,
                expiryTime: 2000000,
                fundDistribution: [0, 0, 0],
                initiatingParty: accounts[2],
                parties: [accounts[4], accounts[5], accounts[6]],
                contractName: "Sample contract 2",
                document:"https://sampleuri.ipfs.io"
            };
            
            await contractFactory.initiateContract(contractData, {from: accounts[2]});
            const myContracts2 = await contractFactory.getMyContracts({from: accounts[2]});
            assert.equal(myContracts2.length, 2);

            const myContracts3 = await contractFactory.getMyContracts({from: accounts[3]});
            assert.equal(myContracts3.length, 1);
        });


        it("To Check the current Stage", async () => {
            await contractStages.currentStage;
            // ContractManagementStages.PartyApprovalPending;
            let Cstage = await contractStages.getContractStage()
            assert.equal(contractStages.currentStage, Cstage)
        });


        // it("Check if all parties approved", async () => {
        //     let approved1 = await contractController.allPartiesApproved()
        //     assert.equal(approved1, true)
        // });

        // it("To check if Payment is Executed", async () => {

        // });

        // it("To check if Contract is Final Approved", async () => {
        //     let allPartiesApproved() = true
        //     let isFinalApprovalCompleted = true
        //     const Fapproval = contractController.finalApproval()
        //     assert.equal(Fapproval, _nextStage())
        // });

        it("To check if Contract is Renewed", async () => {
            await contractMain.methods.checkExpired.send({from :accounts[1]});
            await contractMain.methods.renewContract(1000).send({from :accounts[1]});
            const completeContractData = await contractMain.methods.viewContractData().call({from: accounts[1]});
            assert.equal(completeContractData.expiryTime, 1000)
        });

       


    });
});