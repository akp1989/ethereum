const { getPOSClient } = require("./matic-pos/matic-pos.js")
const { user1,user2,user3, rpc, pos } = require("./matic-pos/config");
const ethers = require('Ethers'); 
const userAddress = user1.address;

const getERC20Balance = async(erc20Address,userAddress,isRoot) =>{
  const posClient = await getPOSClient();
  const erc20Token = posClient.erc20(erc20Address, isRoot);
  const result = await erc20Token.getBalance(userAddress);
  console.log('The balance of the token address ',erc20Address,'is : ',ethers.utils.formatUnits(result,'ether'));
}

const approveERC20 = async(erc20Address,amount) => {
  const posClient = await getPOSClient();
  const erc20Token = posClient.erc20(erc20Address, true);
  const result = await erc20Token.approve(ethers.utils.parseUnits(amount,'ether')._hex);
  const txnHash = await result.getTransactionHash();
  const receipt = await result.getReceipt();
  console.log ('Result as a whole is : ', result);
  console.log ('The transaction hash is :', txnHash);
  console.log(' Receupt for the transaction :' , receipt);
}

const transferERC20 = async(erc20Address,amount,userAddress) => {
  const posClient = await getPOSClient();

  const erc20Token = posClient.erc20(erc20Address,true);
  const result  = await erc20Token.deposit(ethers.utils.parseUnits(amount,'ether')._hex,userAddress);
  const txnHash = await result.getTransactionHash();
  const receipt = await result.getReceipt();
  console.log ('Result as a whole is : ', result);
  console.log ('The transaction hash is :', txnHash);
  console.log(' Receupt for the transaction :' , receipt);

}


 
getERC20Balance(pos.child.erc20,userAddress,false).then(() => process.exit(0))
//approveERC20(pos.parent.erc20,'150').then(() => process.exit(0)) 
//transferERC20(pos.parent.erc20,'99',userAddress).then(() => process.exit(0)) 