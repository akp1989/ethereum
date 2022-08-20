// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./LogicContract.sol";

contract Document{

    /*******************Storage variable - Start**************/
    string documentId;
    //Author name 
    string authorName;
    //Time stamp 
    string timeStamp;
    //The IPFS link
    string ipfsLink;
    //Checksum
    string checkSum;
    //DocumentSecretKey
    string documentSecret;
    //Mapping of reviewers and their ranking
    mapping(address=>int8) public reviewerRanking;

    LogicContract public logicContract;
    /*********Storage variable  - End************/ 



    //Create the master document entry
    function _createDocument(string memory _documentId ,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, string memory _documentSecret, address[] memory _reviewers, address _logicContractAddress) external
    {       
        logicContract = LogicContract(_logicContractAddress);
        for(uint8 rCount=0;rCount< _reviewers.length; rCount++){
            require(logicContract._isValidReviewer(_reviewers[rCount]),"The assigned reviewer is invalid");
        }
        documentId = _documentId;
        authorName = _authorName;
        timeStamp = _timeStamp;
        ipfsLink = _ipfsLink;
        checkSum = _checksum;
        documentSecret = _documentSecret;
        //Assign all the reviewers for the given contract Address
        for(uint8 rCount=0;rCount< _reviewers.length; rCount++){
            reviewerRanking[_reviewers[rCount]] = -1;
        }

    }

    function _readDocument() public view returns(string memory _documentId ,string memory _authorName, string memory  _timeStamp, string memory  _ipfsLink, string memory  _checksum, string memory _documentSecret){
        return (documentId,authorName,timeStamp,ipfsLink,checkSum,documentSecret);
    }

    function addReview(address _reviewer, int8 _ranking) external{       
       reviewerRanking[_reviewer] = logicContract._addReview(_reviewer,_ranking,reviewerRanking[_reviewer]);
    }

    function readReview(address _reviewer) public view returns(int8 _reviewRank){
        return reviewerRanking[_reviewer];
    }

}