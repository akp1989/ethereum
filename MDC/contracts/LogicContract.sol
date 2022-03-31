// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

abstract contract LogicContract{

    /*******************Transaction structure**************/
    struct ContractDetails {
        //Author name 
        string authorName;
        //Time stamp 
        string timeStamp;
        //The IPFS link
        string ipfsLink;
        //Checksum
        string checkSum;
        //Reviwer list
        //List of reviewers
        address[] reviewersAssigned;

    }
    /********* Storage variable  - Start************/ 
    //Map of valid reviewers
    mapping (address => bool) public isReviewer;

    //Map of reviewer ranking -- Numeric value - 
    mapping(address => mapping(address=>int8)) public reviewerRanking;
    /********* Storage variable  - End************/

    /********* Modifiers - Start************/ 
    //Check if the reviewer is assigned for a given contract
    modifier reviewValidReviewer(address _contractAddress, address _reviewer){
        require(reviewerRanking[_contractAddress][_reviewer] != 0, "The reviewer is not authorized for given contract address");
        _;
    }
    //Check if the reviewer has not already reviewed the contract
    modifier reviewNew(address _contractAddress, address _reviewer){
        require(reviewerRanking[_contractAddress][_reviewer] == -1, "The reviewer already reviewed for the given contract");
        _;
    }
    //Check if the review rank is a valid value
    modifier validRank(int8 _reviewRanking){
        require(_reviewRanking >0," The reviewRank is not valid");
        _;
    }

    //Check if the reveiwer exists in the reviewer mapping
    modifier reviewerExists(address _reviewer) {
        require(isReviewer[_reviewer], "The mentioned reviewer does not exist");
        _;
    }
    //Check if the reveiwer exists in the reviewer mapping
    modifier reviewerDoesNotExists(address _reviewer) {
        require(!isReviewer[_reviewer]);
        _;
    }
    /********* Modifiers - End************/ 

    //Add reviewer - Can be performed only by the owner of the master document contract
    function _addReviewer(address _reviewer) internal reviewerDoesNotExists(_reviewer){
       isReviewer[_reviewer] = true;
    }
    //Remove a reviewer - Can be performed only by the owner of the master document contract
    function _removeReviewer(address _reviewer) internal reviewerExists(_reviewer){
        isReviewer[_reviewer] = false;
    }

    //Create the master document entry
    function _createMasterDocument(address _contractAddress,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, address[] memory _reviewers) 
            internal
            returns (ContractDetails memory contractDetails)
    {       
        //Check if the list of reviewer are valid by comparing against the valid reviewer mapping
        for(uint8 rCount=0;rCount< _reviewers.length; rCount++){
            require(isReviewer[_reviewers[rCount]],"The assigned reviewer is invalid");
        }
        
        contractDetails = ContractDetails({
            authorName : _authorName,
            timeStamp : _timeStamp,
            ipfsLink : _ipfsLink,
            checkSum : _checksum,
            reviewersAssigned : _reviewers
        });

        //Assign all the reviewers for the given contract Address
        for(uint8 rCount=0;rCount< _reviewers.length; rCount++){
            reviewerRanking[_contractAddress][_reviewers[rCount]] = -1;
        }

        return(contractDetails);
    }


    //Add a review to a given contract 
    function _addReview(address _contractAddress, address _reviewer, int8 _reviewRank)internal  
             reviewerExists(_reviewer) // The reviewer should be a valid reviewer defined by the owner
             reviewValidReviewer(_contractAddress,_reviewer) // The reviewer should be assigned for the contract (contractaddress(reviewer=>reviwerRank)) != 0
             reviewNew(_contractAddress,_reviewer) // The reviewer has not added a review already (contractaddress(reviwer=>reviewerRank)) == -1
             validRank(_reviewRank) // The review Rank should be a valid positive integer
    {   
        //update the reviewerRanking mapping with the reviwerRank
        reviewerRanking[_contractAddress][_reviewer] = _reviewRank;
    }

}