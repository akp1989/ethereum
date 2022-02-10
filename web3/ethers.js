const genTokenABI = require('./library/genTokenABI');
const Ethers = require("ethers");
const config = require('./library/config')

//Defining the etheres connection and provider
const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);
const wallet = new Ethers.Wallet(config.wallet.privateKey01,ethers);
const wallet1 = new Ethers.Wallet(config.wallet.privateKey01,ethers);

//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.polygon.erc20, genTokenABI, ethers);
//Instantiating a contract with wallet for RW transactions
const genTokenRW = new Ethers.Contract(config.polygon.erc20, genTokenABI, wallet);
const genTokenRW1 = new Ethers.Contract(config.polygon.erc20, genTokenABI, wallet1);

//Getting the latest blockNumber
async function getBlockNumber(){
const blockNumber = await ethers.getBlockNumber();
console.log("Latest Ethereum Block is ",blockNumber);
}

//Getting transaction fee data EIP1599 format
async function getFeeData(){
let feeData = await ethers.getFeeData(); 
console.log("Fee Data:", feeData); 
console.log("Gas Price in Gwei:", Ethers.utils.formatUnits(feeData.gasPrice,'gwei'));
console.log("maxPriorityFeePerGas in Gwei:", Ethers.utils.formatUnits(feeData.maxPriorityFeePerGas,'gwei'));
console.log("maxFeePerGas Price in Gwei:", Ethers.utils.formatUnits(feeData.maxFeePerGas,'gwei'));
return feeData.maxFeePerGas;
}

//Getting balance for ERC20 token
async function getBalance(addressForBalance) {
    const balance = await genToken.balanceOf(addressForBalance);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = Ethers.utils.formatUnits(balance,"ether");
    console.log('Balance of address',addressForBalance, 'is : ',formattedResult);
}

//Getting approval for ERC20 token
async function getApproval(owner, spender){
    var approval = await genToken.allowance(owner,spender);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = Ethers.utils.formatUnits(approval,"ether");
    console.log('The amount approved by ',owner,' for ',spender,'is',formattedResult);
    return approval;
}

async function approve(spender,approvalAmount){
    //parseUnits will take the given number and convert it to the mentioned unit
    const approval = await genTokenRW.approve(spender,approvalAmount);
    console.log('The approval status is',approval);
}

async function transfer(recepient,transferAmount){
    var transferAmount = Ethers.utils.parseUnits(0.49.toString(),'ether');
    const transfer = await genTokenRW.transfer(recepient, transferAmount);
    console.log('The log for transfer of the amount is:', transfer);
}

async function transferFrom(sender,recepient,transferAmount){
    var approvedAmount = await getApproval(sender,wallet1.getAddress());
    var gasLimit = await getFeeData();
    if(transferAmount.gt(approvedAmount))
    {   console.log('Not approved');
        return false;
    }
    console.log('Proceeding with transfer');
    const transfer = await genTokenRW1.transferFrom(sender, recepient, transferAmount,{
        gasLimit:100000
    });
    console.log('The log for transfer of the amount is:', transfer);
}
// getBlockNumber();
// getFeeData();
// getBalance(wallet.getAddress());
// approve(config.wallet.spenderAddress,Ethers.utils.parseUnits(1.0.toString(), "ether"));
// getApproval(wallet.getAddress(),config.wallet.spenderAddress);
// transfer('0xB007C0c163620356E84552bC2A5cb8D454F44bde',Ethers.utils.parseUnits(0.49.toString(),'ether'))
// transferFrom(wallet.getAddress(),'0xB007C0c163620356E84552bC2A5cb8D454F44bde',Ethers.utils.parseUnits(0.35.toString(),'ether'));
