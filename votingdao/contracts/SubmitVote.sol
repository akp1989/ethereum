// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./library/IERC20.sol";
import "./library/Treasury.sol";
import "./library/SafeMath.sol";

contract SubmitVote{
    
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

    /********
    MODIFIERS
    ********/
    //Check if the message sender is a member 
    function onlyMember() internal view  {
        require(members[msg.sender].shares > 0, "Non-member");
    }

    function submitVote(uint256 proposalIndex, address candidate, uint256 votes) public returns (uint256,uint256) {
        //Check if proposal is by member
        onlyMember();
        require(proposalIndex < proposalQueue.length, "No proposal");
        Proposal storage proposal = proposalQueue[proposalIndex];
        if(proposal.objectiveProposal)
            require(votes ==0 || votes ==1, "vote to be 0/1");
        else            
            require(votes>0,"One vote needed");
 
        
        require(block.timestamp < proposal.endingPeriod, "voting period expired");

        Ballot storage memberBallot = proposal.votesByMember[msg.sender];

        // store vote
        uint256 totalVotes;
        uint256 newVotes;
        uint256 quadorNoVotes;

        //Set empty array for new ballot
        if (memberBallot.votes.length == 0) {
            memberBallot.votes = new uint256[](proposal.candidates.length);
            memberBallot.candidate = new address[](proposal.candidates.length);
            memberBallot.quadorNoVotes = new uint256[](proposal.candidates.length);
        }
        for (uint i = 0; i < proposal.candidates.length; i++) {
            if (proposal.candidates[i] == candidate) {
                memberBallot.candidate[i] = candidate;
                if(proposal.objectiveProposal){
                    require( memberBallot.votes[i]==0 && memberBallot.quadorNoVotes[i]==0, "member already voted");
                    if(votes ==0){
                        proposal.totalQuadorNoVotes[i] = proposal.totalQuadorNoVotes[i].add(1);
                        memberBallot.quadorNoVotes[i] = memberBallot.quadorNoVotes[i].add(1);
                    }else if(votes==1){
                        proposal.totalVotes[i] = proposal.totalVotes[i].add(1);
                        memberBallot.votes[i] = memberBallot.votes[i].add(1);
                    }
                    totalVotes = (memberBallot.votes[i]).add(memberBallot.quadorNoVotes[i]);

                }else{
                    uint256 prevquadraticVotes = memberBallot.quadorNoVotes[i];
                    newVotes = memberBallot.votes[i].add(votes);
                    quadorNoVotes = newVotes.sqrt();

                    proposal.totalVotes[i] = proposal.totalVotes[i].add(votes);
                    proposal.totalQuadorNoVotes[i] = proposal.totalQuadorNoVotes[i].sub(prevquadraticVotes).add(quadorNoVotes);
                    memberBallot.votes[i] = newVotes;
                    memberBallot.quadorNoVotes[i] = quadorNoVotes;

                    totalVotes = newVotes;
                }
     
            } 
            
        }
        require(totalVotes <= members[msg.sender].shares, "insufficient shares to vote");
        return (votes,quadorNoVotes);

    }

    function hasVotingExpired(uint256 endingPeriod) internal view returns (bool){
        uint256 currentPeriod = block.timestamp;
        return currentPeriod > endingPeriod;
    }

}
