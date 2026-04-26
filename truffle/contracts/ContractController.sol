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

    // Renewal state
    uint proposedExpiryTime;
    mapping(address => bool) renewalApproved;

    event contractInitialized(address contractAddress);
    event partyApproved(address party, address contractAddress);
    event finalApprovalCompleted(address contractAddress);
    event paymentExecuted(address contractAddress);
    event contractRejectedByParty(address party, address contractAddress);
    event renewalProposed(address initiator, address contractAddress, uint newExpiryTime);
    event renewalApprovedByParty(address party, address contractAddress);
    event contractRenewed(address contractAddress, uint newExpiryTime);

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

    function haveAllPartiesApproved() public view onlyParty returns (bool) {
        bool approved = true ;
        for (uint i=0; i < contractData.parties.length; i++) {
            if (hasPartyApproved[contractData.parties[i]] == false) {
                approved = false;
                break;
            }            
        }
        return approved;
    }

    function hasCurrentPartyApproved() external view onlyParty returns (bool) {
        return hasPartyApproved[msg.sender];
    }

    function hasContractExpired() public view returns (bool) {
        return (1000 * block.timestamp) >= contractData.expiryTime;
    }

    function getContractStage() external view onlyParty returns (uint) {
        return uint(currentStage);
    }

    function viewContractData() external view onlyParty returns (CompleteContractData memory) {
        return contractData;
    }

    function getProposedExpiryTime() external view onlyParty returns (uint) {
        return proposedExpiryTime;
    }

    function hasCurrentPartyApprovedRenewal() external view onlyParty returns (bool) {
        return renewalApproved[msg.sender];
    }

    function _haveAllPartiesApprovedRenewal() internal view returns (bool) {
        // Check that the initiating party has approved
        if (!renewalApproved[contractData.initiatingParty]) return false;
        // Check each party
        for (uint i = 0; i < contractData.parties.length; i++) {
            if (!renewalApproved[contractData.parties[i]]) return false;
        }
        return true;
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
        emit contractInitialized(address(this));
    }

    function approveContract() external onlyParty {
        _atStage(ContractManagementStages.PartyApprovalPending);
        hasPartyApproved[msg.sender] = true;
        if (haveAllPartiesApproved()) {
            _nextStage();
        }
        emit partyApproved(msg.sender, address(this));  
    } 

    function rejectContract() external onlyParty {
        _atStage(ContractManagementStages.PartyApprovalPending);
        _goToRejected();
        emit contractRejectedByParty(msg.sender, address(this));
    }

    function finalApproval() external onlyInitiator {
        _atStage(ContractManagementStages.FinalApprovalPending);
        require(haveAllPartiesApproved() == true, "All parties have not approved");
        isFinalApprovalCompleted = true;
        if (contractData.isPayable == true) {
            makePayment();
        }
        _nextStage();
        emit finalApprovalCompleted(address(this));
    } 

    /// @notice Initiating party proposes a renewal with a new expiry date.
    ///         Moves the contract to RenewalPending and auto-approves for the initiator.
    function proposeRenewal(uint _newExpiryTime) external onlyInitiator {
        _atStage(ContractManagementStages.Expired);
        proposedExpiryTime = _newExpiryTime;

        // Reset all renewal approvals
        renewalApproved[contractData.initiatingParty] = false;
        for (uint i = 0; i < contractData.parties.length; i++) {
            renewalApproved[contractData.parties[i]] = false;
        }

        // Auto-approve for the initiator (they are proposing it)
        renewalApproved[msg.sender] = true;

        _jumpToStage(ContractManagementStages.RenewalPending);
        emit renewalProposed(msg.sender, address(this), _newExpiryTime);
    }

    /// @notice Any party can call this to approve a pending renewal.
    ///         When all parties have approved, contract moves back to Validated (Active).
    function approveRenewal() external onlyParty {
        _atStage(ContractManagementStages.RenewalPending);
        renewalApproved[msg.sender] = true;
        emit renewalApprovedByParty(msg.sender, address(this));

        if (_haveAllPartiesApprovedRenewal()) {
            contractData.expiryTime = proposedExpiryTime;
            _jumpToStage(ContractManagementStages.Validated);
            emit contractRenewed(address(this), proposedExpiryTime);
        }
    }

    function checkExpired() external {
        if (hasContractExpired()) {
            _jumpToStage(ContractManagementStages.Expired);
        }
    }
}