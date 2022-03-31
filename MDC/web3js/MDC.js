const Ethers = require('ethers');
const web3 = require('web3');
var mdcABI = require('./library/mdcABI');

const ethereumAddress = ("http://127.0.0.1:8545");

//Environment details
const ethers = new Ethers.providers.JsonRpcProvider(ethereumAddress);
//Signer details 
const signer = new Ethers.Wallet('f36270af49f04db61e429c17257443f8c1c20690c5f1b1e513a28ef2fa3450cd',ethers);

//Contract details
const mdcContract = new Ethers.Contract('0x8C135609C396A5D9A031d2D97726F5958A2265a3', mdcABI, ethers);

const test = async function(){

    console.log(signer.getAddress());
    console.log(await mdcContract.deployed());
}
const createMDC = async function (contractAddress, authorName, timeStamp, ipfsLink, checksum, reviewers) {
    const result = await mdcContract.connect(signer).createMasterDocument(contractAddress,authorName,timeStamp,ipfsLink,checksum,reviewers);
    console.log(result);
 
};

const readMDC = async function(transactionAddress){
    var result = await mdcContract.readMasterDocument(transactionAddress);
    console.log(Ethers.utils.parseBytes32String(result));
}

const addReviewer = async function(reviwer){
    const result = await mdcContract.connect(signer).addReviewer(reviwer);
    console.log(result);
}

const removeReviewer = async function(reviwer){
    const result = await mdcContract.connect(signer).removeReviewer(reviwer);
    console.log(result);
}

const addReview = async function(contractAddress, reviewer, reviewRank){
    const result = await mdcContract.connect(signer).addReview(contractAddress, reviewer, reviewRank);
    console.log(result);
}


//test();
//createMDC('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2',"Doc1",'18:10:05T','linktest1','checksumtest1', ["0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2","0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044"]);
createMDC('0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044',"Doc2",'18:10:05T','linktest2','checksumtest2', ["0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2","0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044"]);
//createMDC('0xb72830E8D35e3e7C918CE36154fEd566D577AdF7',"Doc3",'18:10:05T','linktest3','checksumtest3', ["0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2","0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044","0xb72830E8D35e3e7C918CE36154fEd566D577AdF7"]);
//createMDC('0xF343fa8ecFbE3bB59d2cdBe9BDD54D43E234F9Df',"Doc4",'18:10:05T','linktest4','checksumtest4', ["0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2","0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044","0xF343fa8ecFbE3bB59d2cdBe9BDD54D43E234F9Df"]);

//readMDC('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2')
//readMDC('0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044')
//readMDC('0xb72830E8D35e3e7C918CE36154fEd566D577AdF7')

//addReview('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2','0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2',7);
//addReview('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2','0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044',7);


/** Adding and removing a reviewer */
//addReviewer('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2');
//addReviewer('0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044');
//addReviewer('0xb72830E8D35e3e7C918CE36154fEd566D577AdF7');

//removeReviewer('0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2');
//removeReviewer('0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044');
//removeReviewer('0xb72830E8D35e3e7C918CE36154fEd566D577AdF7');






















