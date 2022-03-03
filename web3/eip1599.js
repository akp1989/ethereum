
require("log-timestamp");
const ethers = require("ethers");
var Web3 = require('web3');

const privateKey = ("a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593").toString('hex');
const wallet = new ethers.Wallet(privateKey);

const address = wallet.address;
console.log("Public Address:", address);

const httpsUrl = "http://127.0.0.1:8545";
console.log("HTTPS Target", httpsUrl);

const init = async function () {
 
  const httpsProvider = new ethers.providers.JsonRpcProvider(httpsUrl);

  //let nonce = await httpsProvider.getTransactionCount(address);
  console.log(await httpsProvider.getNetwork());
  //console.log("Nonce:", nonce);
   
  //To get the fee data from the ethereum network - Return values are in Wei
  let feeData = await httpsProvider.getFeeData(); 

  console.log("Fee Data:", feeData); 
  
  console.log("Gas Price in Gwei:", Web3.utils.fromWei(Web3.utils.hexToNumberString(feeData.gasPrice._hex),'gwei'));
  console.log("maxPriorityFeePerGas in Gwei:", Web3.utils.fromWei(Web3.utils.hexToNumberString(feeData.maxPriorityFeePerGas._hex),'gwei'));
  console.log("maxFeePerGas Price in Gwei:", Web3.utils.fromWei(Web3.utils.hexToNumberString(feeData.maxFeePerGas._hex),'gwei'));
 

  const tx = {
    type: 2,
    nonce: nonce,
    to: "0x6cb767C924433b3705B66ba117A84eB972B3611D", // Address to send to
    maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"], // Recommended maxPriorityFeePerGas
    maxFeePerGas: feeData["maxFeePerGas"], // Recommended maxFeePerGas
    value: ethers.utils.parseEther("0.01"), // .01 ETH
    gasLimit: "21000", // basic transaction costs exactly 21000
    chainId: 5, // Ethereum network id
  };
  console.log("Transaction Data:", tx);

//   const signedTx = await wallet.signTransaction(tx);
//   console.log("Signed Transaction:", signedTx);

//   const txHash = ethers.utils.keccak256(signedTx);
//   console.log("Precomputed txHash:", txHash);
  

  //httpsProvider.sendTransaction(signedTx).then(console.log);

};

init();