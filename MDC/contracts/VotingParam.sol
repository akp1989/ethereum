// SPDX-License-Identifier: Open Software License 1.0
pragma solidity >=0.4.22 <0.9.0;

import './VotingPInterface.sol';

contract VotingParam is VotingPInterface{

    uint256 private proposalDeposit;
    uint256 private tokenTribute;
    uint256 private processingReward;

    constructor(uint256 _proposalDeposit, uint256 _tokenTribute, uint256 _processingReward){
        proposalDeposit = _proposalDeposit;
        tokenTribute = _tokenTribute;
        processingReward = _processingReward;
    }
    
    function getProposalDeposit() public override view returns(uint256){
        return proposalDeposit;
    }
    function getTokenTribute() public override view returns(uint256){
        return tokenTribute;
    }
    function getProcessingReward() public override view returns(uint256){
        return processingReward;
    }

}