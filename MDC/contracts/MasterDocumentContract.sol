// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LogicContract.sol";


contract MasterDocumentContract is Ownable,LogicContract{

    /***********Events**********************/
    event CreateDocument(address indexed contractAddress);
  
    event ReviewerAddition(address reviewer);

    event ReviewerRemoval(address reviewer);
 
    event ContractReviewed(address contractAddress, address reviewer);
    
    /********* Storage variable  - Start************/ 
    //Map of contracts - Change to documentMap
    mapping(address=>ContractDetails) public contractMap;

    /********* Storage variable  - End************/
    /********* Modifiers - Start************/
    //Check if the contract address is valid
    modifier contractExists(address _contractAddress) {
        require(bytes(contractMap[_contractAddress].authorName).length>0, "The mentioned contract address is not valid");
        _;
    }
    /********* Modifiers - End************/
    /********* Constructor************/ 
    //Initialization changes the owner to the deployers address and sets the reviewers
    constructor(address[] memory _reviewers)
    {   
        //transfer the ownership of the contractor the contract creator
        transferOwnership(msg.sender);
        
        //populate the isOwner mapping with the address from the array of owners
        for (uint iCount=0; iCount<_reviewers.length; iCount++) {
            addReviewer(_reviewers[iCount]);
        }
    
    }

    //Create the master document entry
    function createMasterDocument(address _contractAddress,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, address[] memory _reviewers) public
    {       
        contractMap[_contractAddress] = _createMasterDocument(_contractAddress,_authorName,_timeStamp,_ipfsLink,_checksum,_reviewers);
        emit CreateDocument(_contractAddress);         
    }

    //Read the master document and return the values
    function readMasterDocument(address _contractAddress) public view returns (ContractDetails memory contractDetails){
        return contractMap[_contractAddress];
    }



    //Add a review to a given contract 
    function addReview(address _contractAddress, address _reviewer, int8 _reviewRank)public  
             contractExists(_contractAddress)
    {   
        _addReview(_contractAddress,_reviewer,_reviewRank);
        emit ContractReviewed(_contractAddress, _reviewer);
    }


    //Add reviewer - Can be performed only by the owner of the master document contract
    function addReviewer(address _reviewer) public onlyOwner reviewerDoesNotExists(_reviewer){
       _addReviewer(_reviewer);
       emit ReviewerAddition(_reviewer);
    }
    //Remove a reviewer - Can be performed only by the owner of the master document contract
    function removeReviewer(address _reviewer) public onlyOwner reviewerExists(_reviewer){
        _removeReviewer(_reviewer);
        emit ReviewerRemoval(_reviewer);
    }


}