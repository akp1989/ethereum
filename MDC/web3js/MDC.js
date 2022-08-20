const Ethers = require('ethers'); 
const web3 = require('web3');
var mdcABI = require('./library/mdcABI');

const ethereumAddress = ("http://127.0.0.1:8545");

//Environment details
const ethers = new Ethers.providers.JsonRpcProvider(ethereumAddress);
//Signer details 
const signer = new Ethers.Wallet('ae2e4341251159be1c7bae03b9a81e56c35c0660fe14114e2d6fc0a0c8c441c6',ethers);

//Contract details
const mdcContract = new Ethers.Contract('0xe79De80a4FEbB8122b0dFf6196fB5dA091bd6c3E', mdcABI, ethers);

const test = async function(){

    console.log(signer.getAddress());
    console.log(await mdcContract.deployed());
}
const createMDC = async function (documentId, authorName, timeStamp, ipfsLink, checksum, secretKey, reviewers) {
    const result = await mdcContract.connect(signer).createDocument(documentId,authorName,timeStamp,ipfsLink,checksum,secretKey,reviewers);
    console.log(result);
 
};

const readMDC = async function(documentId){
    var result = await mdcContract.readDocumentByID(documentId);
    //console.log(Ethers.utils.parseBytes32String(result));
    console.log(result);
}

const addReviewer = async function(reviwer){
    const result = await mdcContract.connect(signer).addReviewer(reviwer);
    console.log(result);
}

const removeReviewer = async function(reviwer){
    const result = await mdcContract.connect(signer).removeReviewer(reviwer);
    console.log(result);
}

const addReview = async function(documentId, reviewer, reviewRank){
    const result = await mdcContract.connect(signer).addReview(documentId, reviewer, reviewRank);
    console.log(result);
}

const readReview = async function(documentId, reviewer){
    const result = await mdcContract.readReview(documentId, reviewer);
    console.log(result);
}

const searchByAuthor = async function(authorName){
    let eventFilter = mdcContract.filters.CreateDocument(null,Ethers.utils.formatBytes32String(authorName),null);
    let events = await mdcContract.queryFilter(eventFilter);
    events.forEach((eventDetail)=>{
        const result = eventDetail.args._documentId;
        console.log(Ethers.utils.parseBytes32String(result));
    });
}
const searchByRank = async function(reviewRank){
    var reviewRankCriteria = Array.from({length:reviewRank},(_,i)=>i+1);
    let eventFilter = mdcContract.filters.ContractReviewed(null,reviewRankCriteria);
    let events = await mdcContract.queryFilter(eventFilter);
    events.forEach((eventDetail)=>{
        console.log(eventDetail.args._contractAddress);
    });
}
//test();
//createMDC('document1',"Prabhakaran",'12:00:00','IPFS1','Checksum1','secretkey1', ["0x8FaF48F45082248D80aad06e76d942f8586E6Dcd","0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2"]);
//createMDC('document2',"Prabhakaran",'12:02:00','IPFS2','Checksum2', 'secretkey2', ["0x8FaF48F45082248D80aad06e76d942f8586E6Dcd","0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2"]);
//createMDC('documentx3',"Mrinmoyee",'18:02:00','IPFSx3','Checksumx3', 'secretkey3', ["0x8FaF48F45082248D80aad06e76d942f8586E6Dcd","0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2"]);

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


searchByAuthor('bhavanimrinmoyeehariniprabhakaranariappampalayamkrishnamoorthi');
//searchByRank(2);