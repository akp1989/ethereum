import { BigNumber, ethers } from 'ethers';
const config = require ('./contractABI/config');

var ethersProvider;
var ethersSigner;

var votingContractEthers;

//ABI and address for Master document Contract
const votingContractABI = require('./contractABI/votingContractABI.json')

const initEthers = async(window) =>{
    const{ ethereum } = window;
    ethersProvider = new ethers.providers.Web3Provider(ethereum);
    ethersSigner = ethersProvider.getSigner();
    console.log('EthersSigner initiated with signing address ' , await ethersSigner.getAddress());
} 

const initVotingContract = async() =>{
    await initEthers(window);
    votingContractEthers = new ethers.Contract(config.matic.voting, votingContractABI, ethersProvider);
}

export const createProposal = async(proposalPageModel) =>{
    await initVotingContract();
    var feeData = await getFeeData();
    const isObjective = (proposalPageModel.isObjective === 'true')?true:false;
    var transactionResult = await votingContractEthers.connect(ethersSigner).submitProposal(isObjective,
                                            proposalPageModel.candidates.split(','),
                                            BigNumber.from(proposalPageModel.sharesRequested),
                                            proposalPageModel.ipfsHash,
                                                {
                                                    gasLimit : '500000',
                                                    maxFeePerGas : feeData.maxFeePerGas
                                                }
                                            );
    return (JSON.stringify(transactionResult));
}

export const submitVote = async(proposalIndex,candidate,vote) =>{
    await initVotingContract();
    var feeData = await getFeeData();
    var transactionResult = await votingContractEthers.connect(ethersSigner).submitVote(proposalIndex,
                                                                                        candidate,
                                                                                        vote,
                                                                                        {
                                                                                            gasLimit : '300000',
                                                                                            maxFeePerGas : feeData.maxFeePerGas
                                                                                        });
     return (JSON.stringify(transactionResult));
}

export const processProposal = async(proposalIndex) => {
    await initVotingContract();
    var feeData = await getFeeData();
    var transactionResult = await votingContractEthers.connect(ethersSigner).processProposal(proposalIndex,
                                                                                            {
                                                                                                gasLimit : '200000',
                                                                                                maxFeePerGas : feeData.maxFeePerGas
                                                                                            });
    return (JSON.stringify(transactionResult));
}

export const getProposal = async(proposalIndex) =>{
    await initVotingContract();
    var proposal = await votingContractEthers.getProposal(proposalIndex);
    return (proposal);
}

export const getFeeData = async() =>{
    let feeData = await ethersProvider.getFeeData(); 
    console.log("Fee Data:", feeData); 
    console.log("Gas Price in Gwei:", ethers.utils.formatUnits(feeData.gasPrice,'gwei'));
    console.log("maxPriorityFeePerGas in Gwei:", ethers.utils.formatUnits(feeData.maxPriorityFeePerGas,'gwei'));
    console.log("maxFeePerGas Price in Gwei:", ethers.utils.formatUnits(feeData.maxFeePerGas,'gwei'));
    return feeData;
}
        
// }
// //Getting balance for ERC20 token
// async function getDAOToken() {
//     const tokenAddress = await voting.daoToken();
//     console.log('DAO token address is : ',tokenAddress);
//     return tokenAddress;
// }

// async function getTreasuryAddress() {
//     const treasuryAddress = await voting.getTreasuryAddress();
//     console.log('Treasury address is : ', treasuryAddress);
//     return treasuryAddress;
// }

// async function getCurrentPeriod(){
//     const currentPeriod = await voting.getCurrentPeriod();
//     console.log("CurrentPeriod is :", currentPeriod);
//     return currentPeriod;
// }

// async function getVotingPeriod(){
//     const votingPeriod = await voting.votingPeriodLength();
//     console.log("Voting period is :", votingPeriod);
// }

// async function getPeriodDuration(){
//     const periodDuration = await voting.periodDuration();
//     console.log("Period Duration is :" , periodDuration);
//     return periodDuration;
// }

// async function getTotalShares(){
//     const totalShares = await voting.totalShares();
//     console.log("Total share in this :",totalShares);
//     return totalShares;
// }

// async function getProposalDeposit(){
//     const proposalDeposit = await voting.proposalDeposit();
//     console.log("Proposal deposit is :" , proposalDeposit);
//     return proposalDeposit;
// }

// async function getTokenTribute(){
//     const tokenTribute = await voting.tokenTribute();
//     console.log("The token tribute for the proposal is :", tokenTribute);
//     return tokenTribute;
// }

// async function getProcessingReward(){
//     const processingReward = await voting.processingReward();
//     console.log("The processing reward is :", processingReward);
//     return processingReward;
// }

// async function getProposalByIndex(proposalIndex) {
//     var proposal = await voting.proposalQueue(proposalIndex);
//     console.log('Proposal for Index is  : ',proposal);
//     return proposal;
// }

// async function getMembers(memberAddress) {
//     var memberAddress = await voting.members(memberAddress);
//     console.log('Member at address is  : ',memberAddress);
//     return members;
// }

// async function createProposal(isObjective,candidates, sharesReqeusted, details){
//     var proposal = await votingRW.submitProposal(isObjective,candidates,sharesReqeusted,details);
//     console.log(proposal);
// }

// async function authorizeProposalDeposit(){
//     const daoToken = getDAOToken();
//     const daoTokenSigner = new Ethers.Contract(daoToken, genTokenABI, wallet1);
//     console.log (await daoTokenSigner.approve(config.ganache.voting,getProposalDeposit()));
// }

// async function authorizeTokenTribute(privateKey){
//     const daoToken = getDAOToken();
//     var walletTemp = new Ethers.Wallet(privateKey,ethers);
//     const daoTokenSigner = new Ethers.Contract(daoToken,genTokenABI,walletTemp);
//     console.log(await daoTokenSigner.approve(config.ganache.voting,getTokenTribute()));
// }

// async function checkIfVotingExpired(proposalIndex){
//     const proposal = await voting.proposalQueue(proposalIndex);
//     var isVotingExpired = await voting.hasVotingPeriodExpired(proposal.startingPeriod);
//     console.log("The voting period has expired :", isVotingExpired);
// }

// async function submitVote (proposalIndex, candidate, votes){
//     var submitVoteResult = await votingRW.submitVote(proposalIndex, candidate, votes);
//     console.log(submitVoteResult);
// }

// async function processProposal(proposalIndex){
//     var processProposalResult = await votingRW.processProposal(proposalIndex);
//     console.log(processProposalResult);
// }