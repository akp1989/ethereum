// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
contract Test{

    struct Proposal{
        address proposer;
        address[] candidates;
    }

    Proposal[] public proposalQueue;


    function submitProposal(address[] memory candidates) public {
        Proposal storage proposal = proposalQueue.push();
        proposal.candidates = candidates;
        proposal.proposer = msg.sender;

    }

    function getCandidates(uint256 proposalIndex) public view returns (address[] memory){
         require(proposalIndex < proposalQueue.length, "Invalid proposal");
         Proposal storage proposal = proposalQueue[proposalIndex];
         return proposal.candidates;
    }
}