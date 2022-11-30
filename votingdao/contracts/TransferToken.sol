// SPDX-License-Identifier: Open Software License 1.0
pragma solidity >=0.4.22 <0.9.0;

import './library/IERC20.sol';
import './library/Treasury.sol';
import './StorageVote.sol';

contract TransferToken{

    address private receiver; 
    uint256 private transferAmount;

    bool private isExecuted;
    Treasury private treasury;
    StorageVote private voting;
    IERC20 public daoToken;

    constructor(uint256 _transferAmount, address _receiver,address _daoAddress, address payable _treasuryAddress, address _daoTokenAddress){
        require(_daoAddress != address(0x00),"TokenTransfer :: constructor, Receiver address is a zero address ");
        require(_receiver != address(0x00),"TokenTransfer :: constructor, Receiver address is a zero address ");
        require(_treasuryAddress != address(0x00), "TokenTransfer :: constructor, Token transfer is a zero address");
        require(_daoTokenAddress != address(0x00), "TokenTransfer :: constructor, DAO Token transfer is a zero address");

        voting = StorageVote(_daoAddress);
        treasury =  Treasury(_treasuryAddress);
        daoToken = IERC20(_daoTokenAddress);
        require(voting.isMember(msg.sender), "TokenTransfer :: Cannot be initiated by a non-member");
        transferAmount = _transferAmount;
        receiver = _receiver;
        isExecuted = false;
    }

    function transfer(uint256 proposal, bool isDaoToken) public {
        require(!isExecuted, "TokenTransfer :: transfer, Transfer for the proposal already executed");
        require(voting.isMember(msg.sender), "TokenTransfer :: transfer,  Cannot be called by a non-member");                                                                    
        (,,,,,address electedCandidate,,,,,) = voting.getProposal(proposal);
        require(electedCandidate == address(this), "TokenTransfer :: transfer, The transfer is not supported by a valid proposal");
        if(isDaoToken){
            treasury.transferToken(proposal,receiver, transferAmount);
            isExecuted = true;
        }else{
            treasury.transferNativeToken(proposal,receiver, transferAmount);
            isExecuted = true;
        }
    }


    function balanceOf() public  view returns (uint256){
        return daoToken.balanceOf(address(this));
    }   

    function allowance() public  view returns (uint256) {
        return daoToken.allowance(address(this),address(voting));
    }

    function approve(uint256 value)  public  returns(bool){
        return daoToken.approve(address(voting), value);
    }
}