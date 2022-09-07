// SPDX-License-Identifier: Open Software License 1.0


/**********************************************************
/Make the following changes for testing 
/ 1) Constructor - Change the member initialization to have 4 shares instead of 1 share 
/ 2) sqrt() - Change the scope of the function to public pure view
/ 3) Uncomment the function to add new members
***********************************************************/

pragma solidity >=0.4.22 <0.9.0;

import "./oz/SafeMath.sol";
import "./Treasury.sol";

contract Voting {
    
    using SafeMath for uint256;

    /***************
    GLOBAL CONSTANTS
    ***************/
    uint256 public periodDuration; // default = 17280 = 4.8 hours in seconds (5 periods per day)
    uint256 public votingPeriodLength; // default = 35 periods (7 days)
    uint256 public gracePeriodLength; // default = 35 periods (7 days)
    uint256 public abortWindow; // default = 5 periods (1 day)
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
    uint256 constant MAX_VOTING_PERIOD_LENGTH = 10**18; // maximum length of voting period
    uint256 constant MAX_GRACE_PERIOD_LENGTH = 10**18; // maximum length of grace period
    uint256 constant MAX_NUMBER_OF_SHARES = 10**18; // maximum number of shares that can be minted

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
        uint256 highestIndexVote; // highest proposal index # on which the member voted YES
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
        uint256 maxTotalSharesAtYesVote; // the maximum # of total shares encountered at a yes vote on this proposal
        mapping (address => Ballot) votesByMember; // list of candidates and corresponding votes
    }
    Proposal[] public proposalQueue;

    /********
    MODIFIERS
    ********/
    //Check if the message sender is a member 
    modifier onlyMember {
        require(members[msg.sender].shares > 0, "Voting::onlyMember - not a member");
        _;
    }

    //Check if the message sender is delegated by a member
    modifier onlyDelegate {
        require(members[memberAddressByDelegateKey[msg.sender]].shares > 0, "Voting::onlyDelegate - not a delegate");
        _;
    }


    /*****************
     Events
    *****************/
    event SubmitProposal(uint256 proposalIndex, address indexed delegateKey, address indexed memberAddress, address[] candidates, uint256 tokenTribute, uint256 sharesRequested);
    event SubmitVote(uint256 indexed proposalIndex, address indexed delegateKey, address indexed memberAddress, address candidate, uint256 votes, uint256 quadraticVotes);
    event ProcessProposal(uint256 indexed proposalIndex, address indexed electedCandidate, address indexed memberAddress, uint256 tokenTribute, uint256 sharesRequested, bool didPass);
    event Ragequit(address indexed memberAddress, uint256 sharesToBurn);
    event Abort(uint256 indexed proposalIndex, address applicantAddress);
    event UpdateDelegateKey(address indexed memberAddress, address newDelegateKey);
    event SummonComplete(address indexed summoner, uint256 shares);
    event testEvemt(uint256 var1, uint256 var2, uint256 var3);
    constructor(
        address summoner,
        uint256 _periodDuration,
        uint256 _votingPeriodLength,
        uint256 _gracePeriodLength,
        uint256 _abortWindow,
        uint256 _proposalDeposit,
        uint256 _tokenTribute,
        uint256 _processingReward,
        bool _quadraticMode,
        address _daoTokenAddress
        )  
    {
        require(summoner != address(0), "Voting::constructor - summoner cannot be 0");
        require(_periodDuration > 0, "Voting::constructor - _periodDuration cannot be 0");
        
        require(_votingPeriodLength > 0, "Voting::constructor - _votingPeriodLength cannot be 0");
        require(_votingPeriodLength <= MAX_VOTING_PERIOD_LENGTH, "Voting::constructor - _votingPeriodLength exceeds limit");
        require(_gracePeriodLength <= MAX_GRACE_PERIOD_LENGTH, "Voting::constructor - _gracePeriodLength exceeds limit");
        
        require(_abortWindow > 0, "Voting::constructor - _abortWindow cannot be 0");
        require(_abortWindow <= _votingPeriodLength, "Voting::constructor - _abortWindow must be smaller than or equal to _votingPeriodLength");
        
        require(_proposalDeposit >= _processingReward, "Voting::constructor - _proposalDeposit cannot be smaller than _processingReward");

        require(_tokenTribute >= 0, "Voting::constructor - Token tribute cannot be 0");
        require(_daoTokenAddress != address(0), "The dao token address cannot be zero address" );

        daoToken = IERC20(_daoTokenAddress);
        treasuryAccount = new Treasury(_daoTokenAddress);

        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;
        gracePeriodLength = _gracePeriodLength;
        abortWindow = _abortWindow;
        proposalDeposit = _proposalDeposit;
        tokenTribute = _tokenTribute;
        processingReward = _processingReward;
        quadraticMode = _quadraticMode;
        summoningTime = block.timestamp;
        members[summoner] = Member(summoner, 4, true, 0);
        memberAddressByDelegateKey[summoner] = summoner;
        totalShares = 1;

        emit SummonComplete(summoner, 1);
    }

    function submitProposal(bool objectiveProposal ,address[] memory candidates,
                            uint256 sharesRequested, string memory details)
        public onlyDelegate{

        //Check if candidate list is empty or candidate is null address
        require(candidates.length > 0, "Voting::submitProposal - at least 1 candidate is required.");
        
        //If it is just an ojective proposal then only one candidate should be present
        //Quadratic votes will be used for tracking no votes
        if(objectiveProposal){
            require(candidates.length == 1, "Voting::submitProposal - objectiveProposal needs only one candidate");
        }

        for (uint i=0; i < candidates.length; i++) {
            require(candidates[i] != address(0), "Voting::submitProposal- candidate cannot be 0");
        }

        
        // Note that totalShares + totalSharesRequested + sharesRequested is an upper bound
        // on the number of shares that can exist until this proposal has been processed.
        require(totalShares.add(totalSharesRequested).add(sharesRequested) <= MAX_NUMBER_OF_SHARES, "Voting::submitProposal - too many shares requested");

        totalSharesRequested = totalSharesRequested.add(sharesRequested);

        address memberAddress = memberAddressByDelegateKey[msg.sender];


        //Collect the proposal deposit and store in the treasury
       
        require( daoToken.balanceOf(msg.sender) >= proposalDeposit,"Voting:: submitProposal - proposer does not have enough token for deposit");
        require( daoToken.allowance(msg.sender, address(this)) >= proposalDeposit, "Voting:: submitProposal - deposit transfer not authorized by proposer");
        
        require(daoToken.transferFrom(msg.sender, address(treasuryAccount),proposalDeposit),"Voting:: submitProposal - deposit transfer failed for the proposal");

        //Collect the token tribute from each candidate
        for (uint j=0; j < candidates.length; j++) {
            require(daoToken.balanceOf(candidates[j]) >= tokenTribute.mul(sharesRequested), "Voting:: submitProposal - candidate does not have enough token for deposit");
            require(daoToken.allowance(candidates[j], address(this)) >= tokenTribute.mul(sharesRequested), "Voting:: submitProposal - processing fee transfer not authorized by candidate");
        
            require(daoToken.transferFrom(candidates[j], address(treasuryAccount), tokenTribute.mul(sharesRequested)), "Voting::submitProposal- processing fee transfer failed ");
        }
        
        // compute startingPeriod for proposal
        uint256 startingPeriod = max(
            getCurrentPeriod(),
            proposalQueue.length == 0 ? 0 : proposalQueue[proposalQueue.length.sub(1)].startingPeriod
        ).add(1);

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
        proposal.maxTotalSharesAtYesVote= 0;
   
        uint256 proposalIndex = proposalQueue.length.sub(1);  
        emit SubmitProposal(proposalIndex, msg.sender, memberAddress, candidates, tokenTribute, sharesRequested);
    }



    function submitVote(uint256 proposalIndex, address candidate, uint256 votes) public onlyMember    {
        
        address memberAddress = memberAddressByDelegateKey[msg.sender];
        Member storage member = members[memberAddress];

        require(proposalIndex < proposalQueue.length, "Voting::submitVote - proposal does not exist");
        Proposal storage proposal = proposalQueue[proposalIndex];
        
        if(proposal.objectiveProposal)
            require(votes ==0 || votes ==1, "Voting::submitVote - A vote must be 0 or 1");
        else            
            require(votes>0,"Voting::submitVote - For non objective voting atleast vote should be cast");
        
        
        require(getCurrentPeriod() >= proposal.startingPeriod, "Voting::submitVote - voting period has not started");
        require(!hasVotingPeriodExpired(proposal.startingPeriod), "Voting::submitVote - proposal voting period has expired");
        require(!proposal.aborted, "Voting::submitVote - proposal has been aborted");

        Ballot storage memberBallot = proposal.votesByMember[memberAddress];

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
                    require( memberBallot.votes[i]==0 && memberBallot.quadorNoVotes[i]==0, "Voting::submitVote - member has already voted objectively");
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
                    quadorNoVotes = sqrt(newVotes);

                    proposal.totalVotes[i] = proposal.totalVotes[i].add(votes);
                    proposal.totalQuadorNoVotes[i] = proposal.totalQuadorNoVotes[i].sub(prevquadraticVotes).add(quadorNoVotes);
                    memberBallot.votes[i] = newVotes;
                    memberBallot.quadorNoVotes[i] = quadorNoVotes;

                    totalVotes = newVotes;
                }
 
                if (proposalIndex > member.highestIndexVote) {
                    member.highestIndexVote = proposalIndex;
                }           
            } 
            
        }

        require(totalVotes <= member.shares, "Voting::submitVote - not enough shares to cast this quantity of votes");

        emit SubmitVote(proposalIndex, msg.sender, memberAddress, candidate, votes, quadorNoVotes);

    }


    function processProposal(uint256 proposalIndex) public {
        require(proposalIndex < proposalQueue.length, "Voting::processProposal - proposal does not exist");
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(getCurrentPeriod() >= proposal.startingPeriod.add(votingPeriodLength).add(gracePeriodLength), "Voting::processProposal - proposal is not ready to be processed");
        require(proposal.processed == false, "Voting::processProposal - proposal has already been processed");
        require(proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed, "Voting::processProposal - previous proposal must be processed");

        proposal.processed = true;
        totalSharesRequested = totalSharesRequested.sub(proposal.sharesRequested);
        
        // Get elected candidate
        uint256 largest = 0;
        uint elected = 0;

        require(proposal.totalVotes.length > 0 || proposal.totalQuadorNoVotes.length>0, "Voting::processProposal - this proposal has not received any votes.");
        bool didPass = true;

        address electedCandidate = address(0x0);

        for (uint i = 0; i < proposal.totalVotes.length; i++) {

            if(proposal.objectiveProposal){
 
                if(proposal.totalVotes[i] > proposal.totalQuadorNoVotes[i]){
                    electedCandidate = proposal.candidates[i];
                }else{
                    didPass = false;
                }

            }else{
                if (quadraticMode) {
                    require(proposal.totalQuadorNoVotes[i] != largest, "Voting::processProposal - this proposal has no winner" );
                    if (proposal.totalQuadorNoVotes[i] > largest) {
                        largest = proposal.totalQuadorNoVotes[i];
                        elected = i;
                        electedCandidate = proposal.candidates[i];
                    }
                } else if (proposal.totalVotes[i] > largest) {
                    largest = proposal.totalVotes[i];
                    elected = i;
                    electedCandidate = proposal.candidates[i];
                }
            }
        }
      
        // PROPOSAL PASSED
        if (didPass && !proposal.aborted) {

            proposal.didPass = true;
            proposal.electedCandidate = electedCandidate;

            if (members[memberAddressByDelegateKey[electedCandidate]].exists) {
                address memberToOverride = memberAddressByDelegateKey[electedCandidate];
                memberAddressByDelegateKey[memberToOverride] = memberToOverride;
                members[memberToOverride].delegateKey = memberToOverride;
            }
            // use elected candidate address as delegateKey by default
            members[electedCandidate] = Member(electedCandidate, proposal.sharesRequested, true, 0);
            memberAddressByDelegateKey[electedCandidate] = electedCandidate;

            // mint new shares
            totalShares = totalShares.add(proposal.sharesRequested);

          
        // PROPOSAL FAILED OR ABORTED
        } else {
             
        }

        // // send msg.sender the processingReward
        // require(
        //     approvedToken.transfer(msg.sender, processingReward),
        //     "Moloch::processProposal - failed to send processing reward to msg.sender"
        // );

        // // return deposit to proposer (subtract processing reward)
        // require(
        //     approvedToken.transfer(proposal.proposer, proposalDeposit.sub(processingReward)),
        //     "Moloch::processProposal - failed to return proposal deposit to proposer"
        // );

        emit ProcessProposal(
            proposalIndex,
            electedCandidate,
            proposal.proposer,
            proposal.tokenTribute,
            proposal.sharesRequested,
            didPass
        );
        

    }


    /***************
    GETTER FUNCTIONS
    ***************/

    function max(uint256 x, uint256 y) internal pure returns (uint256) {
        return x >= y ? x : y;
    }

    function sqrt(uint256 x) public pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function getCurrentPeriod() public  view returns (uint256) {
      return block.timestamp.sub(summoningTime).div(periodDuration);
    }

    function getProposalQueueLength() public view returns (uint256) {
        return proposalQueue.length;
    }

    function hasVotingPeriodExpired(uint256 startingPeriod) public view  returns (bool) {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

    function getMemberProposalVote(address memberAddress, uint256 proposalIndex) public view returns (uint256[] memory, uint256[] memory, address[] memory) {
    require(members[memberAddress].exists, "Voting::getMemberProposalVote - member doesn't exist");
    require(proposalIndex < proposalQueue.length, "Voting::getMemberProposalVote - proposal doesn't exist");
    
    uint256[] memory _votes = proposalQueue[proposalIndex].votesByMember[memberAddress].votes;
    uint256[] memory _quadorNoVotes = proposalQueue[proposalIndex].votesByMember[memberAddress].quadorNoVotes;
    address[] memory _candidate = proposalQueue[proposalIndex].votesByMember[memberAddress].candidate;
    return (_votes, _quadorNoVotes, _candidate);
    }

    function addMember(address memberAddress, uint256 shares) public onlyMember {
         members [memberAddress] = Member(memberAddress, shares, true, 0);
         memberAddressByDelegateKey [memberAddress] = memberAddress;
         totalShares = totalShares + shares;
    }

}