// SPDX-License-Identifier: Open Software License 1.0
pragma solidity >=0.4.22 <0.9.0;

import "./Ownable.sol";
import "./IERC20.sol";
import "./SafeMath.sol";

contract Treasury is Ownable{

    using SafeMath for uint256;

    IERC20 public daoToken; 

   // Voting private voting;

    mapping(uint256 => address) private electedCandidateList;
    
    event EtherReceived(address indexed sender,uint256 receivedAmount);
    event TokenTransferred(address indexed receiver, uint256 amount, uint256 indexed proposalIndex);
    event NativeTokenTransferred(address indexed receiver, uint256 amount,uint256 indexed proposalIndex);

    constructor(address daoTokenAddress){ 
        daoToken = IERC20(daoTokenAddress);
        //voting = Voting(msg.sender);
    }

    receive() external payable{
        emit EtherReceived(msg.sender, msg.value);
    }

    function getTokenBalance() public view returns (uint256){
        return daoToken.balanceOf(address(this));
    }

    function getNativeTokenBalance() public view returns (uint256){
        return address(this).balance;
    }

    function transferToken(uint256 proposal, address receiver, uint256 amount) public{
        //require (msg.sender == voting.getProposal(proposal), "Treasury :: transfer, Transfer not initiated by elected candidate");
        bool sent =  daoToken.transfer(receiver, amount);
        require(sent,"Treasury :: transfer, Failed to Send token");   
        emit TokenTransferred(receiver, amount, proposal);
    } 

    function transferNativeToken(uint256 proposal,address receiver, uint256 amount) public{
        //require (msg.sender == voting.getProposal(proposal), "Treasury :: transfer, Transfer not initiated by elected candidate");
        (bool sent, ) =  receiver.call{value: (amount * 1 ether)}("");
        require(sent,"Treasury :: transfer, Failed to Send ether");
        emit NativeTokenTransferred(receiver, (amount * 1 ether), proposal);
    } 

    
}