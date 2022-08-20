const Web3 = require('web3');
var mdcABI = require('./library/mdcABI');
var IPFS = require('ipfs-http-client');  


const ethereumAddress = ("http://127.0.0.1:8545");

const web3 = new Web3(new Web3.providers.HttpProvider(ethereumAddress));

//Contract details
const mdcContract = new web3.eth.Contract(mdcABI, '0xe79De80a4FEbB8122b0dFf6196fB5dA091bd6c3E');



const readMDC = async function(documentId){
    var result = await mdcContract.methods.readDocumentByID(documentId).call();
    console.log((result));
}


const searchByAuthor = async function(authorName){
    var fromBlockNumber = await web3.eth.getBlockNumber()-990;
    console.log(fromBlockNumber);
    let eventDetails = await mdcContract.getPastEvents('CreateDocument', {
    //    filter: {_authorName: Web3.utils.sha3(authorName) },
        topics : [,,,Web3.utils.sha3(authorName)],
        fromBlock: 0,
        toBlock: 'latest'
    })
    eventDetails.forEach((eventDetail)=>{
        const result = eventDetail.returnValues._documentId;
        console.log(Web3.utils.hexToAscii(result));
        //console.log(eventDetail);

    });
 }

 const searchByRank = async function(reviewRank){
    var reviewRankCriteria = Array.from({length:reviewRank},(_,i)=>i+1);
    let eventDetails = await mdcContract.getPastEvents('ContractReviewed', {
        filter:{_reviewRanking : reviewRankCriteria},
        fromBlock: 0,
        toBlock: 'latest'
    })
    eventDetails.forEach((eventDetail)=>{
        const result = eventDetail.returnValues._contractAddress;
        console.log(result);
    });
}

 const checkIpfs = async function(){
    const node= IPFS.create("https://ipfs.infura.io:5001");
    var CID = 'QmeSSNXVRyE4Ai5EVRdov4hZhrtGmDEfap52E4XXYa6fWX'; 
    var sringBuffer = [];
    for await(const chunkData of node.cat(CID))
        stringBuffer = chunkData;
    
    console.log(stringBuffer);
  }

//test();

//readMDC('document1')
//readMDC('document2') 

//addReview('document1','0x8FaF48F45082248D80aad06e76d942f8586E6Dcd',1);
//addReview('document1','0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2',2); 
//addReview('document2','0x8FaF48F45082248D80aad06e76d942f8586E6Dcd',1); 
//addReview('documentx3','0x8FaF48F45082248D80aad06e76d942f8586E6Dcd',1); 

//readReview('document1','0x8FaF48F45082248D80aad06e76d942f8586E6Dcd');
//readReview('document1','0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2'); 

/** Adding and removing a reviewer */
//addReviewer('0x8FaF48F45082248D80aad06e76d942f8586E6Dcd');
//addReviewer('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2'); 

//removeReviewer('0x8FaF48F45082248D80aad06e76d942f8586E6Dcd');
//removeReviewer('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2');


searchByAuthor('QmYuNae92Ta8vTj9PbnhGTVAYjgFsq9udReksmwSo5YT82');
//searchByRank(2);

//checkIpfs();