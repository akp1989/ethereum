const Web3 = require('web3');
var mdcABI = require('./library/mdcABI');
var IPFS = require('ipfs-http-client');

const ethereumAddress = ("http://127.0.0.1:8545");

const web3 = new Web3(new Web3.providers.HttpProvider(ethereumAddress));

//Contract details
const mdcContract = new web3.eth.Contract(mdcABI, '0xa5A11fD0E6406ADbe7fb1Fcff24DE71aE269B938');



const readMDC = async function(documentId){
    var result = await mdcContract.methods.readDocumentByID(documentId).call();
    console.log((result));
}


const searchByAuthor = async function(authorName){
   let eventDetails = await mdcContract.getPastEvents('CreateDocument', {
        topics :[,,Web3.utils.sha3(authorName)],
        fromBlock: 0,
        toBlock: 'latest'
    })
    eventDetails.forEach((eventDetail)=>{
        const result = eventDetail.returnValues._documentAddress;
        console.log(result);
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
    const http= await IPFS.create('/ip4/127.0.0.1/tcp/5001');
    console.log(await http.isOnline());
  }

//test();
//createMDC('document1',"Prabhakaran",'12:00:00','IPFS1','Checksum1', ["0x8FaF48F45082248D80aad06e76d942f8586E6Dcd","0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2"]);
//createMDC('document2',"Prabhakaran",'12:02:00','IPFS2','Checksum2', ["0x8FaF48F45082248D80aad06e76d942f8586E6Dcd","0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2"]);
//createMDC('documentx3',"Mrinmoyee",'18:02:00','IPFSx3','Checksumx3', ["0x8FaF48F45082248D80aad06e76d942f8586E6Dcd","0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2"]);

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


//searchByAuthor("Prabhakaran");
//searchByRank(2);

checkIpfs();