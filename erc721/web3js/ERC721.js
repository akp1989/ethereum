const config = require('./config')
const utils = require('./utils')

const getTokenCount = async() =>{
    const posClient = await getPOSClient();
    const erc721ParentToken = posClient.erc721(config.root.ERC721, true)
    const result = await erc721ParentToken.getTokensCount(config.user.address);
    console.log('TxnHash: ' + result.getTransactionHash());
    console.log('receipt: ' + result.getReceipt());
}

const isApproved = async() => {
    const posClient = await getPOSClient();
    const erc721ParentToken = posClient.erc721(config.root.ERC721, true)
    const result = await erc721ParentToken.isApproved(config.user.tokenId);
    console.log('TxnHash: ' + result.getTransactionHash());
    console.log('receipt: ' + result.getReceipt());
}

const approve = async () => {
    const client = await getPOSClient();
    const erc721Token = client.erc721(config.root.ERC721, true);
  
    const result = await erc721Token.approve(config.root.DERC721, config.user.tokenId);
  
    console.log('TxnHash: ' + result.getTransactionHash());
    console.log('receipt: ' + result.getReceipt());
  
}

const transfer = async () => {
    const client = await getPOSClient();
    const result = await client.depositERC721ForUser(config.root.DERC721, config.user.address, config.user.tokenId)
    console.log('TxnHash: ' + result.getTransactionHash());
    console.log('receipt: ' + result.getReceipt());
}

const burn = async () => {
    const client = await getPOSClient();
    const result = await client.burnERC721(config.child.DERC721, config.user.tokenId)
    console.log('TxnHash: ' + result.getTransactionHash());
    console.log('receipt: ' + result.getReceipt());
}

const execute = async () => {
    const client = await getPOSClient();
    //Get the  burn hash from the burn method
    const burnHash = '';
    const tx = await maticPOSClient.exitERC721(burnHash)
    console.log('TxnHash: ' + result.getTransactionHash());
    console.log('receipt: ' + result.getReceipt());
    
}

