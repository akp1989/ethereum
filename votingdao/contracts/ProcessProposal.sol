// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./library/IERC20.sol";
import "./library/Treasury.sol";
import "./library/SafeMath.sol";

contract ProcessProposal{

    using SafeMath for uint256;
    /***************
    GLOBAL CONSTANTS
    ***************/
    uint256 public constant MAX_LENGTH = 10**18;
    uint256 public votingPeriod; // default = 35 periods (7 days)
    uint256 public proposalDeposit; // default = 10 ETH (~$1,000 worth of ETH at contract deployment)
    uint256 public tokenTribute; //defauly = 1 Eth
    uint256 public processingReward; // default = 0.1 - amount of ETH to give to whoever processes a proposal
    uint256 public summoningTime; // needed to determine the current period
    bool public quadraticMode; // if it will computed quadratic votes over traditional ones
    /******************
    INTERNAL ACCOUNTING
    ******************/
    uint256 public totalShares; // total shares across all members
    uint256 public totalSharesRequested; // total shares that have been requested in unprocessed proposals

    struct Ballot {
    uint256[] votes;
    uint256[] quadorNoVotes;                      
    address[] candidate;
}

    struct Member {
        uint256 shares; // the # of shares assigned to this member
        bool exists; // always true once a member has been created
    }
    
    mapping (address => Member) public members;

    struct Proposal {
        address proposer; // the member who submitted the proposal
        address[] candidates; // list of candidates to include in a ballot
        uint256[] totalVotes; // total votes each candidate received
        uint256[] totalQuadorNoVotes; // calculation of quadratic votes for each candidate
        string details; // Details of the proposal (Can be a member election or rule change)
        address electedCandidate; // address of an electeed candidate
        uint256 sharesRequested; // the # of shares the applicant is requesting
        uint256 startingPeriod; // the period in which voting can start for this proposal
        uint256 endingPeriod;
        bool processed; // true only if the proposal has been processed
        bool didPass; // true only if the proposal has elected a candidate
        bool objectiveProposal;
        uint256 tokenTribute; // amount of tokens offered as tribute
        mapping (address => Ballot) votesByMember; // list of candidates and corresponding votes
    }


    Proposal[] public proposalQueue;

    IERC20 public daoToken;
    Treasury public treasury;

    function processProposal(uint256 proposalIndex) public returns(address,bool){
        
        //Check if proposal exists
        proposalExists(proposalIndex);

        Proposal storage proposal = proposalQueue[proposalIndex];
           
        require((block.timestamp >= proposal.endingPeriod), "not ready");
        
        require(proposal.processed == false, "processed already");
        require(proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed, "previous proposal unprocessed");

        proposal.processed = true;
        totalSharesRequested = totalSharesRequested.sub(proposal.sharesRequested);
        
        // Get elected candidate
        uint256 largest = 0;
        uint elected = 0;
        
      
        bool didPass = true;

        address electedCandidate = address(0x0);

        for (uint i = 0; i < proposal.totalVotes.length; i++) {

            if(proposal.objectiveProposal){
                
                didPass = false;
                if(proposal.totalVotes[i]>0 || proposal.totalQuadorNoVotes[i]>0)
                {
                     if(proposal.totalVotes[i] > proposal.totalQuadorNoVotes[i]){
                        electedCandidate = proposal.candidates[i];
                        didPass = true;
                    }
                }
                

            }else{
                if (quadraticMode) {
                    require(proposal.totalQuadorNoVotes[i] != largest, "no winner" );
                    if (proposal.totalQuadorNoVotes[i] > largest) {
                        largest = proposal.totalQuadorNoVotes[i];
                        elected = i;
                        electedCandidate = proposal.candidates[i];
                    }
                } else if (proposal.totalVotes[i] > largest) {
                    largest = proposal.totalVotes[i];
                    elected = i;
                    electedCandidate = proposal.candidates[i];
                    if( i+1 == proposal.totalVotes.length)
                    require(largest>0, 'proposal received no votes');
                }
            }
        }
               
        // PROPOSAL PASSED
        if (didPass) {

            proposal.didPass = true;
            proposal.electedCandidate = electedCandidate;

            // Applicant is an existing member, create a new record for them
            if (members[electedCandidate].exists) {
                    members[electedCandidate].shares = members[electedCandidate].shares.add(proposal.sharesRequested);

            // Applicant is a new member, create a new record for them
            }else{
                members[electedCandidate] = Member(proposal.sharesRequested, true);
            }
            // mint new shares
            totalShares = totalShares.add(proposal.sharesRequested);

        }
        return (electedCandidate,didPass);
    }

    //Check if the proposal is a valid proposal
    function proposalExists(uint256 proposalIndex)internal view{
        require(proposalIndex < proposalQueue.length, "Invalid proposal");
    }
}