const { getPOSClient } = require("./matic-pos/matic-pos.js")
const { user1,user2,user3, rpc, pos } = require("./matic-pos/config");
const ethers = require('Ethers'); 
const userAddress = user1.address;

const getERC721TokenCount = async(erc721Address,userAddress,isRoot) =>{
  const posClient = await getPOSClient();
  const erc721Token = posClient.erc721(erc721Address, isRoot);
  const result = await erc721Token.getTokensCount(userAddress);
  console.log('The balance of the token address ',erc721Address,'is : ',result);
}


const getERC721All = async(erc721Address,userAddress,limit,isRoot) =>{
    const posClient = await getPOSClient();
    const erc721Token = posClient.erc721(erc721Address, isRoot);
    const result = await erc721Token.getAllTokens(userAddress,limit);
    console.log(result);
    //console.log('The tokens owned by address ',erc721Address,'is : ',result);
}

const isApproved = async(erc721Address,tokenId,isRoot) =>{
    const posClient = await getPOSClient();
    const erc721Token = posClient.erc721(erc721Address, isRoot);
    const result = await erc721Token.isApproved(tokenId);
    console.log(result);
    
}

const isApprovedForAll = async(erc721Address,userAddress,isRoot) =>{
    const posClient = await getPOSClient();
    const erc721Token = posClient.erc721(erc721Address, isRoot);
    const result = await erc721Token.isApprovedAll(userAddress);
    console.log(result);
    
}

const approveERC721 = async(erc721Address,tokenId) => {
  const posClient = await getPOSClient();
  const erc721Token = posClient.erc721(erc721Address, true);
  const result = await erc721Token.approve(tokenId);
  const txnHash = await result.getTransactionHash();
  const receipt = await result.getReceipt();
  //console.log ('Result as a whole is : ', result);
  console.log ('The transaction hash is :', txnHash);
  console.log(' Receipt for the transaction :' , receipt);
}

const approveERC721All = async(erc721Address,tokenId) => {
    const posClient = await getPOSClient();
    const erc721Token = posClient.erc721(erc721Address, true);
    const result = await erc721Token.approveAll();
    const txnHash = await result.getTransactionHash();
    const receipt = await result.getReceipt();
    //console.log ('Result as a whole is : ', result);
    console.log ('The transaction hash is :', txnHash);
    console.log(' Receipt for the transaction :' , receipt);
  }

const transferERC721 = async(erc721Address,tokenId,userAddress) => {
  const posClient = await getPOSClient();

  const erc721Token = posClient.erc721(erc721Address,true);
  const result  = await erc721Token.deposit(tokenId,userAddress);
  const txnHash = await result.getTransactionHash();
  const receipt = await result.getReceipt();
  //console.log ('Result as a whole is : ', result);
  console.log ('The transaction hash is :', txnHash);
  console.log(' Receupt for the transaction :' , receipt);

}

const transferERC721Many = async(erc721Address,tokenIds,userAddress) => {
    const posClient = await getPOSClient();
  
    const erc721Token = posClient.erc721(erc721Address,true);
    const result  = await erc721Token.depositMany(tokenIds,userAddress);
    const txnHash = await result.getTransactionHash();
    const receipt = await result.getReceipt();
    //console.log ('Result as a whole is : ', result);
    console.log ('The transaction hash is :', txnHash);
    console.log(' Receupt for the transaction :' , receipt);
  
  }
 
getERC721TokenCount(pos.child.erc721,userAddress,false).then(() => process.exit(0))
//getERC721All(pos.parent.erc721,userAddress,10,true).then(() => process.exit(0))
//isApproved(pos.parent.erc721,0,true).then(() => process.exit(0))
//isApprovedForAll(pos.parent.erc721,userAddress,true).then(() => process.exit(0))
//approveERC721(pos.parent.erc721,'5').then(() => process.exit(0)) 
//approveERC721All(pos.parent.erc721).then(() => process.exit(0)) 
//transferERC721(pos.parent.erc721,'5',userAddress).then(() => process.exit(0))
//transferERC721Many(pos.parent.erc721,['0','1','2','3','4'],userAddress).then(() => process.exit(0)) 