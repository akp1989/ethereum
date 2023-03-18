// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
 
import "./library/IERC20.sol";
import "./library/Treasury.sol";
import "./library/SafeMath.sol";

contract StorageUser{

    using SafeMath for uint256;
    /***************
    GLOBAL CONSTANTS
    ***************/
    struct Proposal{
        uint16 proposalIndex;
        string proposalName;
    }
    mapping (address => address[]) public userMap;
    mapping (address => Proposal[]) public groupMap;
    
    /******************************************
    /* Events 
    /*****************************************/ 
    event addUserEvent(address indexed user, address indexed group);
    event removeUserEvent(address indexed user, address indexed group);
    event addProposalEvent(address indexed group, uint16 indexed proposalIndex, string indexed proposalName);
    event removeProposalEvent(address indexed group, uint16 indexed proposalIndex);

    /******************************************
    /* Add User
    /*****************************************/
    function addUser(address user, address group) public returns (address[] memory)
    {
        address[] memory groups = userMap[user];
        uint256 groupIndex = getGroupIndex(groups,group);

        require(groupIndex == 0, 'User is already part of the group');
        userMap[user].push(group);

        emit addUserEvent(user, group);
        groups = userMap[user];
        return groups;
    }

    /******************************************
    /* Remove User
    /*****************************************/
    function removeUser(address user, address group) public returns (address[] memory)
    {
        address[] memory groups = userMap[user];

        require(groups.length>0, 'User is undefined or not available');
        uint256 groupIndex = getGroupIndex(groups,group);

        require(groupIndex > 0, 'User is is not part of the group');
        userMap[user][groupIndex-1] = userMap[user][groups.length-1];
        userMap[user].pop();

        emit removeUserEvent(user, group);
        groups = userMap[user];
        return groups;
    }

    function getUserGroups(address user) public view returns (address[] memory){
        return userMap[user];
    }

    /******************************************
    /* Add Proposal
    /*****************************************/
    function addProposal(address group, uint16 proposalIdx,  string memory proposalName) public returns (Proposal[] memory)
    {
        Proposal[] memory proposals = groupMap[group];
        uint256 proposalIndex = getProposalIndex(proposals,proposalIdx);

        require(proposalIndex == 0, 'Proposal already present');
        
        Proposal storage proposal = groupMap[group].push();
        proposal.proposalIndex = proposalIdx;
        proposal.proposalName = proposalName;

        emit addProposalEvent(group, proposalIdx, proposalName);
        proposals = groupMap[group];
        return proposals;
    }

    /******************************************
    /* Remove Proposal
    /*****************************************/
    function removeProposal(address group, uint16 proposalIdx) public returns (Proposal[] memory)
    {
        Proposal[] memory proposals = groupMap[group];

        require(proposals.length>0, 'Group is undefined or not available');
        uint256 proposalIndex = getProposalIndex(proposals,proposalIdx);

        require(proposalIndex > 0, 'Proposal index is not available on the group');
        groupMap[group][proposalIndex-1] = groupMap[group][proposals.length-1];

        groupMap[group].pop();

        emit removeProposalEvent(group, proposalIdx); 
        proposals = groupMap[group];
        return proposals;
    }

    function getGroupProposals(address group) public view returns (Proposal[] memory){
        return groupMap[group];
    }

    /******************************************
    /* Internal Functions
    /*****************************************/
    function getGroupIndex(address[] memory groups, address group) internal pure returns (uint256 index){
        for(index=0; index<groups.length;index++){
            if(groups[index] == group){
                return (index+1);
            }
        }
        return 0;
    }

    function getProposalIndex(Proposal[] memory proposals, uint16 proposalIndex) internal pure returns (uint256 index){
        for(index=0; index<proposals.length;index++){
            if(proposals[index].proposalIndex == proposalIndex){
                return (index+1);
            }
        }
        return 0;
    }


}