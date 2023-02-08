import Web3 from 'web3' 
import { BigNumber, ethers } from 'ethers';

const config = require ('./contractABI/config');

//ABI and address for Master document Contract
const masterdoccontractABI = require('./contractABI/masterdoccontractABI.json')
const masterdoccontractAddress = config.matic.masterdoccontractAddress;

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
    var feeData = await getFeeData();
    var documentId = await searchDocument(documentPageModel.checkSum,'checkSum');
    if(documentId.length==0){
        // var transactionResult = await masterDocContractWeb3.methods.createDocument(documentPageModel.documentId,documentPageModel.authorName,
        //                                                                             documentPageModel.timeStamp, documentPageModel.ipfsLink,
        //                                                                             documentPageModel.checkSum, documentPageModel.reviewers.split(',')).send({from:web3Signer[0]}); 

        var transactionResult = await masterDocContractEthers.connect(ethersSigner).createDocument(documentPageModel.documentId,documentPageModel.authorName,
                                                                                                    documentPageModel.timeStamp, documentPageModel.ipfsLink,
                                                                                                    documentPageModel.checkSum, documentPageModel.secretKey,
                                                                                                    documentPageModel.reviewers.split(','),
                                                                                                    {
                                                                                                        gasLimit : 2000000,
                                                                                                        maxFeePerGas : feeData.maxFeePerGas
                                                                                                    });
        
        return (JSON.stringify(transactionResult));
    }
    else
       return ('Checksum already present with document id ' +  documentId.toString());
        
}

export const readDocumentContract = async(documentId) => {
    await initMasterDocContract(); 
    //var transactionResult = await masterDocContractWeb3.methods.readDocumentByID(documentId).call();
    var transactionResult = await masterDocContractEthers.readDocumentByID(documentId); 
    return  transactionResult;
}
 
export const searchDocument = async (searchKey, searchKeyOption) => {
    await initMasterDocContract(); 
    var searchResponse=[];

    //Polygon only allows searching of last 1000 blocks
    var fromBlock = await web3.eth.getBlockNumber()-990;
    
    if(searchKeyOption=="ownerLog"){
        // Web3 method
        let eventDetails = await masterDocContractWeb3.getPastEvents('CreateDocument', {
            filter: {_authorName: Web3.utils.asciiToHex(searchKey) },
            fromBlock: fromBlock,
            toBlock: 'latest'
        })
        eventDetails.forEach((eventDetail)=>{
            const result = Web3.utils.hexToAscii(eventDetail.returnValues._documentId);
            searchResponse.push(result);
            console.log(eventDetail);
        });

        //Ethers method
        // let eventFilter = masterDocContractEthers.filters.CreateDocument(null,ethers.utils.formatBytes32String(searchKey),null);
        // let events = await masterDocContractEthers.queryFilter(eventFilter);
        // events.forEach((eventDetail)=>{
        //     const result = ethers.utils.parseBytes32String(eventDetail.args._documentId);
        //     searchResponse.push(result);
        // });

       
    } else if(searchKeyOption =="ownerChain"){
        searchResponse = await masterDocContractWeb3.methods.documentByOwner(searchKey).call();
        //searchResponse = await masterDocContractEthers.documentByOwner(searchKey);  
    } else if(searchKeyOption=="checkSum"){
        //Web3 method
        //console.log(Web3.utils.sha3(searchKey));
        //let eventDetails = await masterDocContractWeb3.getPastEvents('allEvents',{
        let eventDetails = await masterDocContractWeb3.getPastEvents('CreateDocument', {
            topics : [,,,Web3.utils.sha3(searchKey)],
            fromBlock: fromBlock,
            toBlock: 'latest'
        })
        eventDetails.forEach((eventDetail)=>{
            const result = Web3.utils.hexToAscii(eventDetail.returnValues._documentId);
            searchResponse.push(result);
    
        });
    } 
   return searchResponse;
}

export const getFeeData = async() =>{
    let feeData = await ethersProvider.getFeeData(); 
    console.log("Gas Price in Gwei:", ethers.utils.formatUnits(feeData.gasPrice,'gwei'));
    console.log("maxPriorityFeePerGas in Gwei:", ethers.utils.formatUnits(feeData.maxPriorityFeePerGas,'gwei'));
    console.log("maxFeePerGas Price in Gwei:", ethers.utils.formatUnits(feeData.maxFeePerGas,'gwei'));
    //Adding 0.1 GWEI to maxFeePerGas to avoid ,maxPriorityFeePerGas cannot be greater than maxFeePerGas
    var additionalValue = feeData.maxFeePerGas.add(BigNumber.from(ethers.utils.parseUnits('0.1','gwei')));
    console.log("Modified maxFeePerGas is : ",ethers.utils.formatUnits(additionalValue,'gwei'));
    feeData.additionalValue = additionalValue;
    console.log("Fee Data:", feeData); 
    return feeData;
}
 