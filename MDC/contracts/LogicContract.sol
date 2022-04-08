// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract LogicContract{

    /********* Storage variable  - Start************/ 
    //Map of valid reviewers
    mapping (address => bool) public isReviewer;
    /********* Storage variable  - End************/

    /********* Modifiers - Start************/ 
    //Check if the reveiwer exists in the reviewer mapping
    modifier reviewerExists(address _reviewer){
        require(isReviewer[_reviewer], "The mentioned reviewer does not exist");
        _;
    }
    //Check if the reveiwer exists in the reviewer mapping
    modifier reviewerDoesNotExists(address _reviewer) {
        require(!isReviewer[_reviewer]);
        _;
    }

    //Check if the reviewer is assigned for a given contract
    modifier reviewValidReviewer(int8 _currentRanking){
        require(_currentRanking != 0, "The reviewer is not authorized for given contract address");
        _;
    }
    //Check if the reviewer has not already reviewed the contract
    modifier reviewNew(int8 _currentRanking){
        require(_currentRanking == -1, "The reviewer already reviewed for the given contract");
        _;
    }
    //Check if the review rank is a valid value
    modifier validRank(int8 _reviewRanking){
        require(_reviewRanking >0," The reviewRank is not valid");
        _;
    }

    /********* Modifiers - End************/ 

    //Add reviewer - Can be performed only by the owner of the master document contract
    function _addReviewer(address _reviewer) external reviewerDoesNotExists(_reviewer){
       isReviewer[_reviewer] = true;
    }
    //Remove a reviewer - Can be performed only by the owner of the master document contract
    function _removeReviewer(address _reviewer) external reviewerExists(_reviewer){
        isReviewer[_reviewer] = false;
    }

    function _isValidReviewer(address _reviewerAddress) external view returns(bool validReviewer){
        return isReviewer[_reviewerAddress];
    }

    //Add a review to a given contract 
    function _addReview(address _reviewer, int8 _newRank,int8 _currentRank) external  view
             reviewerExists(_reviewer) // The reviewer should be a valid reviewer defined by the owner
             reviewValidReviewer(_currentRank) // The reviewer should be assigned for the contract (contractaddress(reviewer=>reviwerRank)) != 0
             reviewNew(_currentRank) // The reviewer has not added a review already (contractaddress(reviwer=>reviewerRank)) == -1
             validRank(_newRank) // The review Rank should be a valid positive integer
             returns (int8 _reviewRank)
    {   
        return _newRank;
    }

    
}