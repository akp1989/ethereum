// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
 
import "./library/IERC20.sol";
import "./library/Treasury.sol";
import "./library/SafeMath.sol";

contract StorageVote{

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


    /******************************************
    /* Functionality contract addresses  
    /*****************************************/
    address submitProposalContract;
    address submitVoteContract;
    address processProposalContract;

    /******************************************
    /* Events 
    /*****************************************/ 
    event SummonComplete(address indexed summoner, uint256 shares);
    event SubmitProposal(uint256 indexed proposalIndex, address indexed memberAddress, address[] candidates, uint256 sharesRequested);
    event SubmitVote(uint256 indexed proposalIndex, address indexed memberAddress, address candidate, uint256 votes, uint256 quadraticVotes);
    event ProcessProposal(uint256 indexed proposalIndex, address indexed electedCandidate, address indexed memberAddress, bool didPass);
    event VotingParamUpdated(uint256 indexed proposalIndex,address indexed paramContract);

    /********
    MODIFIERS
    ********/
    //Check if the message sender is a member 
    function onlyMember() internal view  {
        require(members[msg.sender].shares > 0, "Non-member");
    }

    /********* Constructor************/ 
    //Initialization changes the owner to the deployers address and sets the reviewers
    constructor (
        address summoner,
        uint256 _votingPeriod,
        uint256 _proposalDeposit,
        uint256 _tokenTribute,
        uint256 _processingReward,
        bool _quadraticMode,
        address _daoTokenAddress,
        address _submitProposal,
        address _submitVote,
        address _processProposal
        )
    {
        require(summoner != address(0), "Summoner 0");

        
        require(_votingPeriod > 0, "Votinglength 0");
        require(_votingPeriod <= MAX_LENGTH, "Voting period limits");
        
        require(_proposalDeposit >= _processingReward, "Deposit lt reward");

        require(_tokenTribute >= 0, "Tribute 0");
        require(_daoTokenAddress != address(0), "Dao Token 0" );
        require(_submitProposal != address(0), "Submit proposal is 0");
        require(_submitVote != address(0),"Submit vote is 0");
        require(_processProposal != address(0),"Process proposal is 0");

        daoToken = IERC20(_daoTokenAddress);
        treasury = new Treasury(_daoTokenAddress);

        votingPeriod = _votingPeriod;
        proposalDeposit = _proposalDeposit;
        tokenTribute = _tokenTribute;
        processingReward = _processingReward;
        quadraticMode = _quadraticMode;
        summoningTime = block.timestamp;
        members[summoner] = Member(4, true);
        totalShares = 4;
        totalSharesRequested = 0;
        submitProposalContract = _submitProposal;
        submitVoteContract = _submitVote;
        processProposalContract = _processProposal;

        emit SummonComplete(summoner, 1);
    }

    /******************************************
    /* Submit Proposal
    /*****************************************/
    function submitProposal(bool objectiveProposal ,address[] memory candidates,
                            uint256 sharesRequested, string memory details)
    public{
         (bool success, bytes memory result) = submitProposalContract.delegatecall(
            abi.encodeWithSignature("submitProposal(bool,address[],uint256,string)", 
                                    objectiveProposal,
                                    candidates,
                                    sharesRequested,
                                    details
                                    ));
        if(!success){
            if(result.length<68) revert();
            assembly {
                result := add(result, 0x04)
            }
            revert(abi.decode(result, (string)));
        }
        emit SubmitProposal(abi.decode(result,(uint256)), msg.sender, candidates, sharesRequested);
    }

        
    /******************************************
    /* Submit vote
    /*****************************************/
    function submitVote (uint256 proposalIndex, address candidate, uint256 votes) public {
        (bool success, bytes memory result) = submitVoteContract.delegatecall(
            abi.encodeWithSignature("submitVote(uint256,address,uint256)",
                                    proposalIndex,
                                    candidate,
                                    votes));

        if(!success){
            if(result.length<68) revert();
            assembly{
                result := add(result,0x04)
            }
            revert(abi.decode(result,(string)));
        }   
        (uint256 vote, uint256 quadVote) = abi.decode(result,(uint256,uint256));
        emit SubmitVote(proposalIndex, msg.sender, candidate, vote, quadVote);
    }

    /******************************************
    /* Process Proposal
    /*****************************************/
    function processProposal (uint256 proposalIndex ) public {
    (bool success, bytes memory result) = processProposalContract.delegatecall(
        abi.encodeWithSignature("processProposal(uint256)",
                                proposalIndex));

    if(!success){
        if(result.length<68) revert();
        assembly{
            result := add(result,0x04)
        }
        revert(abi.decode(result,(string)));
    }   
    (address electedCandidate, bool didPass) = abi.decode(result,(address,bool));
    emit ProcessProposal(proposalIndex, electedCandidate, msg.sender, didPass);

    }

    /******************************************
    /* Process Voting Results
    /*****************************************/
    function processVotingResult (uint256 proposalIndex, uint8 processingCode ) public {
    (bool success, bytes memory result) = processProposalContract.delegatecall(
        abi.encodeWithSignature("processVotingResult(uint256,uint8)",
                                proposalIndex,
                                processingCode));

    if(!success){
        if(result.length<68) revert();
        assembly{
            result := add(result,0x04)
        }
        revert(abi.decode(result,(string)));
    }   
    (address electedCandidate) = abi.decode(result,(address));
    emit VotingParamUpdated(proposalIndex,electedCandidate);

    }
 
    function getProposal(uint256 proposalIndex) public view returns(address proposer, 
                                                                    string memory details,
                                                                    address[] memory candidates,
                                                                    uint256[] memory totalVotes,
                                                                    uint256[] memory totalQuadorNoVotes,
                                                                    address electedCandidate,
                                                                    uint256 sharesRequested,
                                                                    uint256 startingPeriod,
                                                                    uint256 endingPeriod,
                                                                    bool processed,
                                                                    bool didPass,
                                                                    bool objectiveProposal
                                                                    ){
        require(proposalIndex < proposalQueue.length, "Invalid proposal");
        Proposal storage proposal = proposalQueue[proposalIndex];    
        return (proposal.proposer,
                proposal.details,
                proposal.candidates,
                proposal.totalVotes,
                proposal.totalQuadorNoVotes,
                proposal.electedCandidate,
                proposal.sharesRequested,
                proposal.startingPeriod,
                proposal.endingPeriod,
                proposal.processed,
                proposal.didPass,
                proposal.objectiveProposal);
    }

    function isMember(address memberAddress) public view returns (bool){
        return(members[memberAddress].shares > 0);
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

    function addMember(address memberAddress, uint256 shares) public  {
        //Check if proposal is by member
        onlyMember();
        members [memberAddress] = Member(shares, true);
        totalShares = totalShares.add(shares);
    }


    bool isToggle;

    function doNothing() public{
        if(isToggle)
            isToggle = false;
        else
            isToggle = true;
    }

       
}
