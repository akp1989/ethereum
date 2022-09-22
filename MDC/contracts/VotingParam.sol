// SPDX-License-Identifier: Open Software License 1.0
pragma solidity >=0.4.22 <0.9.0;

import './VotingPInterface.sol';
import './oz/IERC20.sol';

contract VotingParam is VotingPInterface{

    
    uint256 private proposalDeposit;
    uint256 private tokenTribute;
    uint256 private processingReward;
    IERC20 public daoToken;


    constructor(uint256 _proposalDeposit, uint256 _tokenTribute, uint256 _processingReward,address _daoTokenAddress){
        require(_daoTokenAddress != address(0), "VotingParam::Constructor - The dao token address cannot be zero address" );
        require(_proposalDeposit > 0, "VotingParam::Constructor - The proposal deposit should be a positive value");
        require(_tokenTribute > 0, "VotingParam::Constructor - The token tribute should be a positive value");
        require(_processingReward > 0, "VotingParam::Constructor - The processing rewards should be a positive value");
        
        proposalDeposit = _proposalDeposit;
        tokenTribute = _tokenTribute;
        processingReward = _processingReward;
        daoToken = IERC20(_daoTokenAddress); 
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

    function balanceOf() public override view returns (uint256){
        return daoToken.balanceOf(address(this));
    }   

    function allowance(address spender) public override view returns (uint256) {
        return daoToken.allowance(address(this),spender);
    }

    function approve(address spender, uint256 value)  public override returns(bool){
        return daoToken.approve(spender, value);
    }
    

}