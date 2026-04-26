// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract ContractStages {

    enum ContractManagementStages {
        PartyApprovalPending,   // 0
        FinalApprovalPending,   // 1
        Validated,              // 2
        Expired,                // 3
        RenewalPending,         // 4
        Rejected                // 5
    }

    ContractManagementStages internal currentStage = ContractManagementStages.PartyApprovalPending;

    function _atStage(ContractManagementStages _stage) internal view {
        require(currentStage == _stage, "Not in expected stage");
    }

    function _nextStage() internal {
        require(uint(currentStage) + 1 <= 2, "Invalid stage");
        currentStage = ContractManagementStages(uint(currentStage) + 1);
    }

    function _jumpToStage(ContractManagementStages _stage) internal {
        currentStage = _stage;
    }

    function _goToRejected() internal {
        currentStage = ContractManagementStages.Rejected;
    }
}