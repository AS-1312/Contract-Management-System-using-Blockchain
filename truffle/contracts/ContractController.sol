// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IContractInit.sol";
import "./ContractStages.sol";

contract ContractController is IContractInit, ContractStages, Initializable {
    CompleteContractData contractData;
    address daiTokenAddress;
    bool isFinalApprovalCompleted;

    mapping(address => bool) hasPartyApproved;
    mapping(address => uint) fundDistribution;

    event contractInitialized(address contractAddress);
    event partyApproved(address party, address contractAddress);
    event finalApprovalCompleted(address contractAddress);
    event paymentExecuted(address contractAddress);
    event contractRejectedByParty(address party, address contractAddress);

    modifier onlyInitiator() {
        require(msg.sender == contractData.initiatingParty, "Not initiating party");
        _;
    }

    modifier onlyParty() {
        bool isParty;
        if (contractData.initiatingParty == msg.sender) {
            isParty = true;
        } else {
            for (uint i = 0; i < contractData.parties.length; ++i) {
                if (contractData.parties[i] == msg.sender) {
                    isParty = true;
                    break;
                }
            }
        }
        require(isParty, "Not a party to the contract");
        _;
    }

    function allPartiesApproved() private view returns(bool) {
        bool approved = true ;
        for(uint i=0;i<contractData.parties.length;i++){
            if(hasPartyApproved[contractData.parties[i]]==false){
                approved = false;
                break;
            }            
        }
        return approved;
    }

    function getContractStage() external view onlyParty returns (uint) {
        return uint(currentStage);
    }

    function viewContractData() external view returns (CompleteContractData memory) {
        return contractData;
    }

    function makePayment() private {
        for (uint i=0; i < contractData.parties.length; i++) {
            bool success = IERC20(daiTokenAddress).transfer(
                contractData.parties[i],
                fundDistribution[contractData.parties[i]]
            );
            require(success, "DAI transfer failed");
        }
        emit paymentExecuted(address(this));
    }

    function initialize(
        CompleteContractData calldata _contractData,
        address _daiTokenAddress
    )
        external 
        initializer
    {
        contractData = _contractData;
        daiTokenAddress = _daiTokenAddress;
        if (_contractData.isPayable) {
            for (uint i=0; i < _contractData.fundDistribution.length; i++) {
                fundDistribution[_contractData.parties[i]] = _contractData.fundDistribution[i];
            }
        }
        _nextStage();
        emit contractInitialized(address(this));
    }
    function approveContract() external onlyParty {
        _atStage(ContractManagementStages.PartyApprovalPending);
        hasPartyApproved[msg.sender] = true;
        emit partyApproved(msg.sender, address(this));  
    } 

    function rejectContract() external onlyParty {
        _atStage(ContractManagementStages.PartyApprovalPending);
        _goToRejected();
        emit contractRejectedByParty(msg.sender, address(this));
    }

    function finalApproval() external onlyInitiator {
        _atStage(ContractManagementStages.FinalApprovalPending);
        require(allPartiesApproved() == true, "All parties have not approved");
        isFinalApprovalCompleted = true;
        if (contractData.isPayable == true) {
            makePayment();
        }
        _nextStage();
        emit finalApprovalCompleted(address(this));
    } 

    function renewContract(uint extendedTime) external onlyInitiator {
        _atStage(ContractManagementStages.Expired);
        contractData.expiryTime += extendedTime;
    }
}