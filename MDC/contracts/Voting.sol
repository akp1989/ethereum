// SPDX-License-Identifier: Open Software License 1.0

/**********************************************************
/Make the following changes for testing 
/ 1) Constructor - Change the member initialization to have 4 shares instead of 1 share 
/ 3) Uncomment the testing helper functions
***********************************************************/

pragma solidity >=0.4.22 <0.9.0;

import "./oz/SafeMath.sol";
import "./Treasury.sol";
import "./VotingParam.sol";

contract Voting {
    
    using SafeMath for uint256;

    /***************
    GLOBAL CONSTANTS
    ***************/
    uint256 public periodDuration; // default = 17280 = 4.8 hours in seconds (5 periods per day)
    uint256 public votingPeriodLength; // default = 35 periods (7 days)
    uint256 public proposalDeposit; // default = 10 ETH (~$1,000 worth of ETH at contract deployment)
    uint256 public tokenTribute; //defauly = 1 Eth
    uint256 public processingReward; // default = 0.1 - amount of ETH to give to whoever processes a proposal
    uint256 public summoningTime; // needed to determine the current period
    bool public quadraticMode; // if it will computed quadratic votes over traditional ones


    IERC20 public daoToken;
    Treasury public treasuryAccount;

    // HARD-CODED LIMITS
    // These numbers are quite arbitrary; they are small enough to avoid overflows when doing calculations
    // with periods or shares, yet big enough to not limit reasonable use cases.
    uint256 constant MAX_LENGTH = 10**18; // maximum length of voting period
  
    /******************
    INTERNAL ACCOUNTING
    ******************/
    uint256 public totalShares = 0; // total shares across all members
    uint256 public totalSharesRequested = 0; // total shares that have been requested in unprocessed proposals

    struct Ballot {
        uint256[] votes;
        uint256[] quadorNoVotes;                      
        address[] candidate;
    }

    struct Member {
        address delegateKey; // the key responsible for submitting proposals and voting - defaults to member address unless updated
        uint256 shares; // the # of shares assigned to this member
        bool exists; // always true once a member has been created
    }
    
    mapping(address => bool) public noone;
    mapping (address => Member) public members;
    mapping (address => address) public memberAddressByDelegateKey;  //mapping (delegateKey => memberAddress)

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
        bool aborted; // true only if applicant calls "abort" fn before end of voting period

        bool objectiveProposal;

        uint256 tokenTribute; // amount of tokens offered as tribute
        mapping (address => Ballot) votesByMember; // list of candidates and corresponding votes
    }
    Proposal[] public proposalQueue;

    /********
    MODIFIERS
    ********/
    //Check if the message sender is a member 
    modifier onlyMember {
        require(members[msg.sender].shares > 0, "V:onlyMember - not a member");
        _;
    }

    //Check if the message sender is delegated by a member
    modifier onlyDelegate {
        require(members[memberAddressByDelegateKey[msg.sender]].shares > 0, "V:onlyDelegate - not a delegate");
        _;
    }

    //Check if the proposal is a valid proposal
    modifier proposalExists(uint256 proposalIndex){
        require(proposalIndex < proposalQueue.length, "V:proposal does not exist");
        _;
    }


    /*****************
     Events
    *****************/
    event SubmitProposal(uint256 proposalIndex, address indexed delegateKey, address indexed memberAddress, address[] candidates, uint256 tokenTribute, uint256 sharesRequested);
    event SubmitVote(uint256 indexed proposalIndex, address indexed delegateKey, address indexed memberAddress, address candidate, uint256 votes, uint256 quadraticVotes);
    event ProcessProposal(uint256 indexed proposalIndex, address indexed electedCandidate, address indexed memberAddress, uint256 tokenTribute, uint256 sharesRequested, bool didPass);
    event Abort(uint256 indexed proposalIndex, address applicantAddress);
    event UpdateDelegateKey(address indexed memberAddress, address newDelegateKey);
    event SummonComplete(address indexed summoner, uint256 shares);
    event VotingParamUpdated(uint256 indexed proposalIndex,address indexed paramContract);

    //event testEvemt(uint var1, uint var2, uint var3);
    constructor(
        address summoner,
        uint256 _periodDuration,
        uint256 _votingPeriodLength,
        uint256 _proposalDeposit,
        uint256 _tokenTribute,
        uint256 _processingReward,
        bool _quadraticMode,
        address _daoTokenAddress
        )  
    {
        require(summoner != address(0), "V:const summoner cannot be 0");
        require(_periodDuration > 0, "V:const periodDuration cannot be 0");
        
        require(_votingPeriodLength > 0, "V:const votingPeriodLength cannot be 0");
        require(_votingPeriodLength <= MAX_LENGTH, "V:const votingPeriodLength exceeds limit");
        
        require(_proposalDeposit >= _processingReward, "V:const proposalDeposit cannot be smaller than _processingReward");

        require(_tokenTribute >= 0, "V:const Token tribute cannot be 0");
        require(_daoTokenAddress != address(0), "V:const The dao token address cannot be zero address" );

        daoToken = IERC20(_daoTokenAddress);
        treasuryAccount = new Treasury(_daoTokenAddress);

        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;
        proposalDeposit = _proposalDeposit;
        tokenTribute = _tokenTribute;
        processingReward = _processingReward;
        quadraticMode = _quadraticMode;
        summoningTime = block.timestamp;
        members[summoner] = Member(summoner, 4, true);
        memberAddressByDelegateKey[summoner] = summoner;
        totalShares = 4;

        emit SummonComplete(summoner, 1);
    }

    function submitProposal(bool objectiveProposal ,address[] memory candidates,
                            uint256 sharesRequested, string memory details)
        public onlyDelegate{

        //Check if candidate list is empty or candidate is null address
        require(candidates.length > 0, "V:submitProposal - at least 1 candidate is required.");
        
        //If it is just an ojective proposal then only one candidate should be present
        //Quadratic votes will be used for tracking no votes
        if(objectiveProposal){
            require(candidates.length == 1, "V:submitProposal - objectiveProposal needs only one candidate");
        }

        for (uint i=0; i < candidates.length; i++) {
            require(candidates[i] != address(0), "V:submitProposal- candidate cannot be 0");
        }

        // Note that totalShares + totalSharesRequested + sharesRequested is an upper bound
        // on the number of shares that can exist until this proposal has been processed.
        require(totalShares.add(totalSharesRequested).add(sharesRequested) <= MAX_LENGTH, "V:submitProposal - too many shares requested");

        totalSharesRequested = totalSharesRequested.add(sharesRequested);

        address memberAddress = memberAddressByDelegateKey[msg.sender];

        //Collect the proposal deposit and store in the treasury
        require( daoToken.balanceOf(msg.sender) >= proposalDeposit,"V: submitProposal - proposer does not have enough token for deposit");
        require( daoToken.allowance(msg.sender, address(this)) >= proposalDeposit, "V: submitProposal - deposit transfer not authorized by proposer");
        
        require(daoToken.transferFrom(msg.sender, address(treasuryAccount),proposalDeposit),"V: submitProposal - deposit transfer failed for the proposal");

        //Collect the token tribute from each candidate
        for (uint j=0; j < candidates.length; j++) {
            require(daoToken.balanceOf(candidates[j]) >= tokenTribute.mul(sharesRequested), "V: submitProposal - candidate does not have enough token for deposit");
            require(daoToken.allowance(candidates[j], address(this)) >= tokenTribute.mul(sharesRequested), "V: submitProposal - processing fee transfer not authorized by candidate");
            require(daoToken.transferFrom(candidates[j], address(treasuryAccount), tokenTribute.mul(sharesRequested)), "V:submitProposal- processing fee transfer failed ");
        }
        
        // compute startingPeriod for proposal
        uint256 startingPeriod = getCurrentPeriod().max(proposalQueue.length == 0 ? 0 : proposalQueue[proposalQueue.length.sub(1)].startingPeriod).add(1);

        // create proposal ...
        Proposal storage proposal = proposalQueue.push(); 
        
        proposal.proposer = memberAddress;
        proposal.candidates= candidates;
        proposal.totalVotes= new uint256[](candidates.length);
        proposal.totalQuadorNoVotes= new uint256[](candidates.length);
        proposal.sharesRequested= sharesRequested;
        proposal.startingPeriod= startingPeriod;
        proposal.processed= false;
        proposal.didPass= false;
        proposal.electedCandidate= address(0x0);
        proposal.aborted= false;
        proposal.objectiveProposal = objectiveProposal;
        proposal.tokenTribute= tokenTribute;
        proposal.details= details;
   
        uint256 proposalIndex = proposalQueue.length.sub(1);  
        emit SubmitProposal(proposalIndex, msg.sender, memberAddress, candidates, tokenTribute, sharesRequested);
    }



    function submitVote(uint256 proposalIndex, address candidate, uint256 votes) public onlyMember    {
        require(proposalIndex < proposalQueue.length, "V:submitVote - proposal does not exist");
        Proposal storage proposal = proposalQueue[proposalIndex];
        if(proposal.objectiveProposal)
            require(votes ==0 || votes ==1, "V:submitVote - A vote must be 0 or 1");
        else            
            require(votes>0,"V:submitVote - For non objective voting atleast vote should be cast");
 
        require(getCurrentPeriod() >= proposal.startingPeriod, "V:submitVote - voting period has not started");
        require(!hasVotingPeriodExpired(proposal.startingPeriod), "V:submitVote - proposal voting period has expired");
        require(!proposal.aborted, "V:submitVote - proposal has been aborted");

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
                    require( memberBallot.votes[i]==0 && memberBallot.quadorNoVotes[i]==0, "V:submitVote - member has already voted objectively");
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
        require(totalVotes <= members[msg.sender].shares, "V:submitVote - not enough shares to cast this quantity of votes");

        emit SubmitVote(proposalIndex, msg.sender, msg.sender, candidate, votes, quadorNoVotes);

    }


    function processProposal(uint256 proposalIndex) public proposalExists(proposalIndex) {
        Proposal storage proposal = proposalQueue[proposalIndex];
           
        require(getCurrentPeriod() >= proposal.startingPeriod.add(votingPeriodLength), "V:processProposal - proposal is not ready to be processed");
        
        require(proposal.processed == false, "V:processProposal - proposal has already been processed");
        require(proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed, "V:processProposal - previous proposal must be processed");

        proposal.processed = true;
        totalSharesRequested = totalSharesRequested.sub(proposal.sharesRequested);
        
        // Get elected candidate
        uint256 largest = 0;
        uint elected = 0;
        
      
        bool didPass = true;

        address electedCandidate = address(0x0);

        for (uint i = 0; i < proposal.totalVotes.length; i++) {

            if(proposal.objectiveProposal){
                
                require(proposal.totalVotes[i]>0 || proposal.totalQuadorNoVotes[i]>0, "Voting:processProposal - Objective proposal has no votes");
                
                if(proposal.totalVotes[i] > proposal.totalQuadorNoVotes[i]){
                    electedCandidate = proposal.candidates[i];
                }else{
                    didPass = false;
                }

            }else{
                if (quadraticMode) {
                    require(proposal.totalQuadorNoVotes[i] != largest, "V:processProposal - this proposal has no winner" );
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
                    require(largest>0, 'V:processProposal - This proposal received no votes');
                }
            }
        }
               
        // PROPOSAL PASSED
        if (didPass && !proposal.aborted) {

            proposal.didPass = true;
            proposal.electedCandidate = electedCandidate;

            // Applicant is an existing member, create a new record for them
            if (members[electedCandidate].exists) {
                    members[electedCandidate].shares = members[electedCandidate].shares.add(proposal.sharesRequested);

            // Applicant is a new member, create a new record for them
            }else{
                if (members[memberAddressByDelegateKey[electedCandidate]].exists) 
                {
                    address memberToOverride = memberAddressByDelegateKey[electedCandidate]; // Take out the delegator(candidate -> delegator)
                    memberAddressByDelegateKey[memberToOverride] = memberToOverride; // (candidate -> delegator) set (delegator -> delegator)
                    members[memberToOverride].delegateKey = memberToOverride; //change memberData for delegator (delegateKey:delegateKey)
                }
                // use elected candidate address as delegateKey by default
                members[electedCandidate] = Member(electedCandidate, proposal.sharesRequested, true);
                memberAddressByDelegateKey[electedCandidate] = electedCandidate; //set (candidate -> candidate)
            }
            // mint new shares
            totalShares = totalShares.add(proposal.sharesRequested);

        }

        emit ProcessProposal(
            proposalIndex,
            electedCandidate,
            proposal.proposer,
            proposal.tokenTribute,
            proposal.sharesRequested,
            didPass
        );
    
    }

    function abort(uint256 proposalIndex) public proposalExists(proposalIndex) { 
        bool applicant = false;
        for (uint i = 0; i < proposalQueue[proposalIndex].totalVotes.length; i++) {
            address electedCandidate = proposalQueue[proposalIndex].candidates[i];  
            if (msg.sender == electedCandidate){
                applicant = true;
            }
        }
        require(applicant == true, "V:abort - msg.sender must be applicant");
        require(getCurrentPeriod() < proposalQueue[proposalIndex].startingPeriod.add(votingPeriodLength), "V:abort - abort window must not have passed");
        require(!proposalQueue[proposalIndex].aborted, "V:abort - proposal must not have already been aborted");

        proposalQueue[proposalIndex].aborted = true;

        emit Abort(proposalIndex, msg.sender);
    }

    function updateDelegateKey(address newDelegateKey) public onlyMember {
        require(newDelegateKey != address(0), "V:updateDelegateKey - newDelegateKey cannot be 0");

        // skip checks if member is setting the delegate key to their member address
        if (newDelegateKey != msg.sender) {
            require(!members[newDelegateKey].exists, "V:updateDelegateKey - cant overwrite existing members");
            require(!members[memberAddressByDelegateKey[newDelegateKey]].exists, "V:updateDelegateKey - cant overwrite existing delegate keys");
        }

        Member storage member = members[msg.sender];
        memberAddressByDelegateKey[member.delegateKey] = address(0);
        memberAddressByDelegateKey[newDelegateKey] = msg.sender;
        member.delegateKey = newDelegateKey;

        emit UpdateDelegateKey(msg.sender, newDelegateKey);
    }

    function updateVotingParams(uint256 proposalIndex) public onlyMember proposalExists(proposalIndex){
        Proposal storage proposal = proposalQueue[proposalIndex];
        require(proposal.didPass == true, "V:updateConf - Proposal is not processed yet");
        require(proposal.aborted == false, "V:updateConf = Proposal aborted");
        require(proposal.electedCandidate!= address(0x0),"V:updateConf - Elected candidate is a zero address");

        VotingParam votingParam = VotingParam(proposal.electedCandidate);
        proposalDeposit = votingParam.getProposalDeposit();
        tokenTribute = votingParam.getTokenTribute();
        processingReward = votingParam.getProcessingReward();
        emit VotingParamUpdated(proposalIndex, proposal.electedCandidate);
    }


    // function donothing()public onlyMember{
    //     if(noone[msg.sender])
    //         noone[msg.sender] = false;
    //     else
    //         noone[msg.sender] = true;
    // }

    function getCurrentPeriod() public  view returns (uint256) {
      return block.timestamp.sub(summoningTime).div(periodDuration);
    }

    function hasVotingPeriodExpired(uint256 startingPeriod) public view  returns (bool) {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

    /* Testing helpers */

    function getProposalQueueLength() public view returns (uint256) {
        return proposalQueue.length;
    }

    function getMemberProposalVote(address memberAddress, uint256 proposalIndex) public view returns (uint256[] memory, uint256[] memory, address[] memory) {
    return (proposalQueue[proposalIndex].votesByMember[memberAddress].votes, 
            proposalQueue[proposalIndex].votesByMember[memberAddress].quadorNoVotes,
            proposalQueue[proposalIndex].votesByMember[memberAddress].candidate);
    }

    function addMember(address memberAddress, uint256 shares) public onlyMember {
         members [memberAddress] = Member(memberAddress, shares, true);
         memberAddressByDelegateKey [memberAddress] = memberAddress;
         totalShares = totalShares.add(shares);
    }


}