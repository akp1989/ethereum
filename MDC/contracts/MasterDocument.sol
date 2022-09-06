// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./oz//Ownable.sol";
import "./Document.sol";
import "./LogicContract.sol";


contract MasterDocument is Ownable{

    /***********Events**********************/
    event CreateDocument(bytes32 indexed _documentId, bytes32 indexed _authorName, string indexed _checksum);
    
    event ReviewerAddition(address _reviewer);

    event ReviewerRemoval(address _reviewer);
 
    event ContractReviewed(bytes32 indexed _documentId, address indexed _contractAddress, int8 indexed _reviewRanking );
    
    /********* Storage variable  - Start************/ 
    //Map of contracts - Change to documentMap
    //Document[] public documentMap;

    mapping(string => address) public documentAddressMap;

    mapping(string => string[]) public documentOwnershipMap;

    LogicContract public logicContract;

    /********* Storage variable  - End************/

    /********* Constructor************/ 
    //Initialization changes the owner to the deployers address and sets the reviewers
    constructor(address _logicContractAddress /*,address[] memory _reviewers*/)
    {   
        //transfer the ownership of the contractor the contract creator
        transferOwnership(msg.sender);
        logicContract = LogicContract(_logicContractAddress);

        //  //populate the isOwner mapping with the address from the array of owners
        // for (uint iCount=0; iCount<_reviewers.length; iCount++) {
        //     addReviewer(_reviewers[iCount]);
        // }
       
    
    }

    //Create the master document entry
    function createDocument(string memory _documentId,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, string memory _documentSecret, address[] memory _reviewers) public
    {       
        Document document = new Document();
        //documentMap.push(document);
        documentAddressMap[_documentId] = address(document);
        documentOwnershipMap[_authorName].push(_documentId);
        document._createDocument(_documentId, _authorName,  _timeStamp, _ipfsLink,  _checksum, _documentSecret,_reviewers,address(logicContract));
        //emit CreateDocument(address(document), _authorName,_authorName);  
        emit CreateDocument(bytes32(bytes(_documentId)),bytes32(bytes(_authorName)),_checksum);       
    }

    // function readDocumentByIndex(uint _index) external view returns(string memory _documentId ,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum)
    // {
    //      return readDocument(address(documentMap[_index]));
    // }

    function readDocumentByID(string memory _documentIdInput) external view returns(string memory _documentId ,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, string memory _documentSecret)
    {
         return readDocument(documentAddressMap[_documentIdInput]);
    }

    function readDocument(address _documentAddress) internal view returns(string memory _documentId ,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, string memory _documentSecret)
    {
         Document document = Document(_documentAddress);
         return document._readDocument();
    }

    function documentByOwner(string memory _authorName) external view returns(string[] memory _documentList)
    {
        return documentOwnershipMap[_authorName]; 
    }

    function addReview(string memory _documentID, address _reviewer, int8 _reviewRanking) external {
        address _documentAddress = documentAddressMap[_documentID];
        Document document = Document(_documentAddress);
        document.addReview(_reviewer, _reviewRanking);
        emit ContractReviewed(bytes32(bytes(_documentID)),_documentAddress, _reviewRanking);
    }

    function readReview(string memory _documentID, address _reviewer) public view returns (int8 reviewRank){
        address _documentAddress = documentAddressMap[_documentID];
        Document document = Document(_documentAddress);
        return document.readReview(_reviewer);
    }

    //Add reviewer - Can be performed only by the owner of the master document contract
    function addReviewer(address _reviewer) public onlyOwner{
       logicContract._addReviewer(_reviewer);
       emit ReviewerAddition(_reviewer);
    }
    //Remove a reviewer - Can be performed only by the owner of the master document contract
    function removeReviewer(address _reviewer) public onlyOwner{
        logicContract._removeReviewer(_reviewer);
        emit ReviewerRemoval(_reviewer);
    }

   
}
