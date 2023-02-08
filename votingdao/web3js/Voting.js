const votingABI = require('./library/votingContractABI');
const genTokenABI = require('./library/genTokenABI');
const Ethers = require("ethers");
const Web3 = require("web3");
const config = require('./library/config');
const { parseTransaction } = require('ethers/lib/utils');

//Defining the etheres connection and provider
//MaticMumbai
const ethers = new Ethers.providers.JsonRpcProvider(config.ganache.httpurl);
const wallet1 = new Ethers.Wallet(config.wallet.address01.privateKey,ethers);
 
const genToken = new Ethers.Contract(config.ganache.genToken, genTokenABI, ethers); 
const genTokenRW = new Ethers.Contract(config.ganache.genToken, genTokenABI, wallet1);

// const  web3Provider = new Web3.providers.HttpProvider(config.ganache.httpurl);
// web3 = new Web3(web3Provider);
// var votingWeb3 = new web3.eth.Contract(votingABI, config.ganache.voting);

// const ethers = new Ethers.providers.JsonRpcProvider(config.ganache.httpurl);
// const wallet1 = new Ethers.Wallet(config.wallet.address01.privateKey,ethers);
// const wallet2 = new Ethers.Wallet(config.wallet.address02.privateKey,ethers);

//Instantiating a contract with providers for read transactions
const voting = new Ethers.Contract(config.ganache.voting,votingABI, ethers);
//Instantiating a contract with wallet for RW transactions
const votingRW = new Ethers.Contract(config.ganache.voting, votingABI, wallet1);


//Getting balance for ERC20 token
async function getDAOToken() {
     const tokenAddress = await voting.daoToken();
    //const tokenAddress = await votingWeb3.methods.daoToken().call();
    console.log('DAO token address is : ',tokenAddress);
    return tokenAddress;
}

async function getTreasuryAddress() {
    const treasuryAddress = await voting.treasury();
    console.log('Treasury address is : ', treasuryAddress);
    return treasuryAddress;
}

async function getVotingPeriod(){
    const votingPeriod = await voting.votingPeriod();
    console.log("Voting period is :", votingPeriod);
}

async function getProposalDeposit(){
    const proposalDeposit = await voting.proposalDeposit();
    console.log("Proposal deposit is :" , proposalDeposit);
    return proposalDeposit;
}

async function getTokenTribute(){
    const tokenTribute = await voting.tokenTribute();
    console.log("The token tribute for the proposal is :", tokenTribute);
    return tokenTribute;
}

async function getProcessingReward(){
    const processingReward = await voting.processingReward();
    console.log("The processing reward is :", processingReward);
    return processingReward;
}

async function getSummoningTime(){
    const summoningTime = await voting.summoningTime();
    console.log("The summoning time is :", summoningTime.toNumber());
    const date = new Date( summoningTime.toNumber()*1000);
    console.log(date);
}

async function isQuadratic(){
    const quadratic = await voting.quadraticMode();
    console.log('Quadratic mode status :', quadratic);
}

async function getProposalByIndex(proposalIndex) {
    var proposal = await voting.getProposal(proposalIndex);
    console.log('Proposal for Index is  : ',proposal);
    return proposal;
}




async function getMembers(memberAddress) {
    var members = await voting.members(memberAddress);
    console.log('Member at address is  : ',members);
    return members;
}



async function isMemeber(candidate){
    var result = await voting.isMember(candidate);
    console.log(result);
}

async function electedCandidate(proposalIndex){
    var result = await voting.getElectedCandidate(proposalIndex);
    console.log(result);
}

async function createProposal(isObjective,candidates, sharesReqeusted, details){
    var proposal = await votingRW.submitProposal(isObjective,candidates,sharesReqeusted,details);
    console.log(proposal);
}

async function authorizeProposalDeposit(){
    const daoToken = getDAOToken();
    const daoTokenSigner = new Ethers.Contract(daoToken, genTokenABI, wallet1);
    console.log (await daoTokenSigner.approve(config.ganache.voting,getProposalDeposit()));
}

async function authorizeTokenTribute(privateKey){
    const daoToken = getDAOToken();
    var walletTemp = new Ethers.Wallet(privateKey,ethers);
    const daoTokenSigner = new Ethers.Contract(daoToken,genTokenABI,walletTemp);
    console.log(await daoTokenSigner.approve(config.ganache.voting,getTokenTribute()));
}

async function checkIfVotingExpired(proposalIndex){
    const proposal = await voting.proposalQueue(proposalIndex);
    var isVotingExpired = await voting.hasVotingPeriodExpired(proposal.startingPeriod);
    console.log("The voting period has expired :", isVotingExpired);
}

async function submitVote (proposalIndex, candidate, votes){
    var submitVoteResult = await votingRW.submitVote(proposalIndex, candidate, votes);
    console.log(submitVoteResult);
}

async function processProposal(proposalIndex){
    var processProposalResult = await votingRW.processProposal(proposalIndex);
    console.log(processProposalResult);
}

async function getCandidates(proposalIndex){
    var candidates = await voting.getCandidates(proposalIndex);
    console.log(candidates);

}


//getMembers(config.walletMeta.address03.publicKey);
//isMemeber(config.walletMeta.address01.publicKey);
//getProposalByIndex(3);

//electedCandidate(2);

//getDAOToken();
//getTreasuryAddress(); 
//getVotingPeriod();
//getProposalDeposit();
//getTokenTribute();
//getProcessingReward();
//getSummoningTime();
//isQuadratic();
// createProposal('false', [config.wallet.address02.publicKey],'1',"Proposal2");
// getProposalByIndex(1);
//nothing();
submitVote(1,config.wallet.address02.publicKey,1);
//authorizeProposalDeposit();
//authorizeTokenTribute(config.wallet.address02.privateKey)

//checkIfVotingExpired(0);
//processProposal(0);
//getCandidates(0);
// async function testFormat (){
// console.log(Ethers.utils.parseEther("1"));
// console.log(Ethers.utils.formatEther(1));
// }

// testFormat();