// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./library/IERC20.sol";
import "./library/Treasury.sol";
import "./library/SafeMath.sol";

contract SubmitProposal{
    
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



    function submitProposal(bool objectiveProposal,address[] memory candidates,uint256 sharesRequested,string memory details) public returns(uint256){
        //Check if proposal submitted by delegator
        onlyMember();

        //Check if candidate list is empty or candidate is null address
        require(candidates.length > 0, "Candidate list empty");
        
        //If it is just an ojective proposal then only one candidate should be present
        //Quadratic votes will be used for tracking no votes
        if(objectiveProposal){
            require(candidates.length == 1, "1 candiate only");
        }

        for (uint i=0; i < candidates.length; i++) {
            require(candidates[i] != address(0), "Candidate is 0");
        }
        // Note that totalShares + totalSharesRequested + sharesRequested is an upper bound
        // on the number of shares that can exist until this proposal has been processed.
        require(totalShares.add(totalSharesRequested).add(sharesRequested) <= MAX_LENGTH, "Too many shares req");

        totalSharesRequested = totalSharesRequested.add(sharesRequested);


        //Collect the proposal deposit and store in the treasury
        require( daoToken.balanceOf(msg.sender) >= proposalDeposit,"Proposer lacks token for deposit");
        require( daoToken.allowance(msg.sender, address(this)) >= proposalDeposit, "Transfer not authorized by proposer");
        
        require(daoToken.transferFrom(msg.sender, address(treasury),proposalDeposit),"Deposit transfer failed");

        //Collect the token tribute from each candidate
        for (uint j=0; j < candidates.length; j++) {
            require(daoToken.balanceOf(candidates[j]) >= tokenTribute.mul(sharesRequested), "Candidate lack token deposit");
            require(daoToken.allowance(candidates[j], address(this)) >= tokenTribute.mul(sharesRequested), "Transfer not authorized by candidate");
            require(daoToken.transferFrom(candidates[j], address(treasury), tokenTribute.mul(sharesRequested)), "Failed processing fee transfer");
        }
        
        // compute startingPeriod for proposal
        uint256 startingPeriod = getCurrentPeriod().max(proposalQueue.length == 0 ? 0 : proposalQueue[proposalQueue.length.sub(1)].startingPeriod).add(1);

        // create proposal ...
        Proposal storage proposal = proposalQueue.push(); 
        
        proposal.proposer = msg.sender;
        proposal.candidates= candidates;
        proposal.totalVotes= new uint256[](candidates.length);
        proposal.totalQuadorNoVotes= new uint256[](candidates.length);
        proposal.sharesRequested= sharesRequested;
        proposal.startingPeriod= startingPeriod;
        proposal.processed= false;
        proposal.didPass= false;
        proposal.electedCandidate= address(0x0);
        proposal.objectiveProposal = objectiveProposal;
        proposal.tokenTribute= tokenTribute;
        proposal.details= details;
   
        uint256 proposalIndex = proposalQueue.length.sub(1);  

        return proposalIndex;

    }

    function getCurrentPeriod() public  view returns (uint256) {
      return block.timestamp.sub(summoningTime).div(periodDuration);
    }


    
}