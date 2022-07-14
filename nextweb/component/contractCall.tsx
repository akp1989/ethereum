import Web3 from 'web3'
import { ethers } from 'ethers';

//ABI and address for Master document Contract
const masterdoccontractABI = require('./contractABI/masterdoccontractABI.json')
const masterdoccontractAddress = '0x2adBFc7f1E69181006bc4bb8079ee054BdF9aB8A';

var web3;
var web3Signer;
var ethersProvider;
var ethersSigner;

var masterDocContractWeb3;
var masterDocContractEthers;

const initWeb3 = async(window) =>{
    const { ethereum } = window;
    web3 = new Web3(ethereum);
    web3Signer = await (web3.eth.getAccounts());
    console.log('Web3 provider initiated with signing address', web3Signer[0]);
    //return web3;
}

const initEthers = async(window) =>{
    const{ ethereum } = window;
    ethersProvider = new ethers.providers.Web3Provider(ethereum);
    ethersSigner = ethersProvider.getSigner();
    console.log('EthersSigner initiated with signing address ' , await ethersSigner.getAddress());
} 

const initMasterDocContract = async() =>{
    await initWeb3(window);
    masterDocContractWeb3 = new web3.eth.Contract(masterdoccontractABI,masterdoccontractAddress);

    await initEthers(window);
    masterDocContractEthers = new ethers.Contract(masterdoccontractAddress, masterdoccontractABI, ethersProvider);
}

export const createDocumentContract = async(documentPageModel) =>{
    await initMasterDocContract();
    // var transactionResult = await masterDocContractWeb3.methods.createDocument(documentPageModel.documentId,documentPageModel.authorName,
    //                                                                             documentPageModel.timeStamp, documentPageModel.ipfsLink,
    //                                                                             documentPageModel.checkSum, documentPageModel.reviewers.split(',')).send({from:web3Signer[0]}); 

    var transactionResult = await masterDocContractEthers.connect(ethersSigner).createDocument(documentPageModel.documentId,documentPageModel.authorName,
                                                                                                documentPageModel.timeStamp, documentPageModel.ipfsLink,
                                                                                                documentPageModel.checkSum, documentPageModel.reviewers.split(','));
 
    return (JSON.stringify(transactionResult));
}

export const readDocumentContract = async(documentId) => {
    await initMasterDocContract(); 
    //var transactionResult = await masterDocContractWeb3.methods.readDocumentByID(documentId).call();
    var transactionResult = await masterDocContractEthers.readDocumentByID(documentId); 
    return  transactionResult;
}
