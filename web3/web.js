const Web3 = require('web3');
const genTokenABI = require('./library/genTokenABI');
const Ethers = require("ethers");

const privateKey = ("a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593").toString('hex');

//Defining the web3 connection and provider
const httpsUrl = "http://127.0.0.1:8545";
const  web3Provider = new Web3.providers.HttpProvider(httpsUrl);
var web3 = new Web3(web3Provider);

 
//Address details
const tokenAddress = "0x365f844477D3b2AE1174306DC36AEbA73818b1e7";
const ownerAddress = "0x743937C03780c9490FF93B9c9937591d48017167";
const spenderAddress = "0x6cb767C924433b3705B66ba117A84eB972B3611D";     
//Instantiating a contract
var getTokenContract = new web3.eth.Contract(genTokenABI, tokenAddress);

//Getting the latest blockNumber
async function getBlockNumber(){
const blockNumber = await web3.eth.getBlockNumber();
console.log("Latest Ethereum Block is ",blockNumber);
}

async function getGasPrice(){
let gasPrice = await web3.eth.getGasPrice();
console.log('Gas price using web3 :' + gasPrice);
console.log("Gas Price in Gwei using web3:", web3.utils.fromWei(gasPrice,'gwei'));
}

async function getBalance() {
const result = await getTokenContract.methods.balanceOf(ownerAddress).call(); 
const formattedResult = web3.utils.fromWei(result);
console.log(formattedResult);
}

async function getApproval(){
 
    const approval = await getTokenContract.methods.allowance(ownerAddress,spenderAddress).call();
    const formattedResult = web3.utils.fromWei(approval);
    console.log (approval);
}




getBlockNumber();
getBalance();
getApproval();


















// const init = async function () {
 
//   const httpsProvider = new ethers.providers.JsonRpcProvider(httpsUrl);

//   //let nonce = await httpsProvider.getTransactionCount(address);
//   console.log(await httpsProvider.getNetwork());
//   //console.log("Nonce:", nonce);
   
//   //To get the fee data from the ethereum network - Return values are in Wei
//   let feeData = await httpsProvider.getFeeData(); 

//   console.log("Fee Data:", feeData); 
  
//   console.log("Gas Price in Gwei:", Web3.utils.fromWei(Web3.utils.hexToNumberString(feeData.gasPrice._hex),'gwei'));
//   console.log("maxPriorityFeePerGas in Gwei:", Web3.utils.fromWei(Web3.utils.hexToNumberString(feeData.maxPriorityFeePerGas._hex),'gwei'));
//   console.log("maxFeePerGas Price in Gwei:", Web3.utils.fromWei(Web3.utils.hexToNumberString(feeData.maxFeePerGas._hex),'gwei'));
 

//   const tx = {
//     type: 2,
//     nonce: nonce,
//     to: "0x6cb767C924433b3705B66ba117A84eB972B3611D", // Address to send to
//     maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"], // Recommended maxPriorityFeePerGas
//     maxFeePerGas: feeData["maxFeePerGas"], // Recommended maxFeePerGas
//     value: ethers.utils.parseEther("0.01"), // .01 ETH
//     gasLimit: "21000", // basic transaction costs exactly 21000
//     chainId: 5, // Ethereum network id
//   };
//   console.log("Transaction Data:", tx);

// //   const signedTx = await wallet.signTransaction(tx);
// //   console.log("Signed Transaction:", signedTx);

// //   const txHash = ethers.utils.keccak256(signedTx);
// //   console.log("Precomputed txHash:", txHash);
  

//   //httpsProvider.sendTransaction(signedTx).then(console.log);

// };

// init();