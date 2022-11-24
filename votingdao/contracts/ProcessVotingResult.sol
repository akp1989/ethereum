// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./library/IERC20.sol";
import "./library/Treasury.sol";
import "./library/SafeMath.sol";
import "./VotingParams.sol";

contract ProcessVotingResult{

    using SafeMath for uint256;
    /***************
    GLOBAL CONSTANTS
    ***************/
    uint256 public constant MAX_LENGTH = 10**18; 
    uint256 public periodDuration; // default = 17280 = 4.8 hours in seconds (5 periods per day)
    uint256 public votingPeriodLength; // default = 35 periods (7 days)
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

    function processVotingResult(uint256 proposalIndex, uint8 processingCode) public returns (address){
        //Check if proposal is by member
        onlyMember();
        //Check if proposal exists
        proposalExists(proposalIndex);
        
        Proposal storage proposal = proposalQueue[proposalIndex];
        require(proposal.didPass == true, "Proposal not processed");
        require(proposal.electedCandidate!= address(0x0),"Elected candidate is 0");
        
        if(processingCode == 0)
        {
            VotingParams votingParam = VotingParams(proposal.electedCandidate);
            proposalDeposit = votingParam.getProposalDeposit();
            tokenTribute = votingParam.getTokenTribute();
            processingReward = votingParam.getProcessingReward();

        }

        return proposal.electedCandidate;
    }


    //Check if the proposal is a valid proposal
    function proposalExists(uint256 proposalIndex)internal view{
        require(proposalIndex < proposalQueue.length, "Invalid proposal");
    }
}