// Users :
// 0x8FaF48F45082248D80aad06e76d942f8586E6Dcd
// 0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2
// 0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044

// Groups : 
// 0xb72830E8D35e3e7C918CE36154fEd566D577AdF7
// 0xF343fa8ecFbE3bB59d2cdBe9BDD54D43E234F9Df
// 0x506736285Bd0A07c487f63D7Fe151893FEFbC333
// 0x576D67C05039006c1c682f36C7C042386110A697
// 0x69dF5329A3028681FE808eaa20FFD891f3753524

const Ethers = require("ethers");
const Web3 = require("web3");
const config = require('./library/config');
const userContractABI = require('./library/userContractABI.json')


//Defining the etheres connection and provider
//MaticMumbai
// const ethers = new Ethers.providers.JsonRpcProvider(config.matic.httpurl);
// const wallet1 = new Ethers.Wallet(config.walletMeta.address01.privateKey,ethers);

// //Instantiating a contract with providers for read transactions
// const user = new Ethers.Contract(config.matic.user,userContractABI, ethers);
// //Instantiating a contract with wallet for RW transactions
// const userRW = new Ethers.Contract(config.matic.user, userContractABI, wallet1);


const ethers = new Ethers.providers.JsonRpcProvider(config.ganache.httpurl);
const wallet1 = new Ethers.Wallet(config.wallet.address01.privateKey,ethers);
const wallet2 = new Ethers.Wallet(config.wallet.address02.privateKey,ethers);

// //Instantiating a contract with providers for read transactions
const user = new Ethers.Contract(config.ganache.user,userContractABI, ethers);
// //Instantiating a contract with wallet for RW transactions
const userRW = new Ethers.Contract(config.ganache.user, userContractABI, wallet1);

async function getUser(userAddress) {
    var groups = await user.getUserGroups(userAddress);
    console.log('The groups for given members are : ',groups);
    return groups;
}

async function getProposal(groupAddress) {
    var proposals = await user.getGroupProposals(groupAddress);
    console.log('The active proposals for given group are  : ',proposals);
    // console.log('The active proposals for given group are  : ',proposals[0].proposalIndex,proposals[0].proposalName);
    return proposals;
}

async function addUser(userAddress,groupAddress){
    var addUser = await userRW.addUser(userAddress,groupAddress);
    console.log('User Added :', addUser);
}

async function removeUser(userAddress,groupAddress){
    var removeUser = await userRW.removeUser(userAddress,groupAddress);
    console.log('User Added :', removeUser);
}

async function addProposal(groupAddress,proposalIdx,proposalName){
    var addProposal = await userRW.addProposal(groupAddress,proposalIdx,proposalName);
    console.log('User Added :', addProposal);
}

async function removeProposal(groupAddress,proposalIdx){
    var removeProposal = await userRW.removeProposal(groupAddress,proposalIdx);
    console.log('User Added :', removeProposal);
}

// addUser('0x8FaF48F45082248D80aad06e76d942f8586E6Dcd','0xb72830E8D35e3e7C918CE36154fEd566D577AdF7');
// removeUser('0x8FaF48F45082248D80aad06e76d942f8586E6Dcd','0xb72830E8D35e3e7C918CE36154fEd566D577AdF7');
// getUser('0x8FaF48F45082248D80aad06e76d942f8586E6Dcd');

// addProposal('0xF343fa8ecFbE3bB59d2cdBe9BDD54D43E234F9Df',0,'proposal0');
// removeProposal('0xF343fa8ecFbE3bB59d2cdBe9BDD54D43E234F9Df',0);
getProposal('0xF343fa8ecFbE3bB59d2cdBe9BDD54D43E234F9Df');