const genTokenABI = require('./library/genTokenABI');
const Ethers = require("ethers");
const config = require('./library/config')

//Defining the etheres connection and provider
//MaticMumbai
// const ethers = new Ethers.providers.JsonRpcProvider(config.matic.httpurl);
// const wallet1 = new Ethers.Wallet(config.walletMeta.address01.privateKey,ethers);
 
// const genToken = new Ethers.Contract(config.matic.genToken, genTokenABI, ethers); 
// const genTokenRW = new Ethers.Contract(config.matic.genToken, genTokenABI, wallet1);


const ethers = new Ethers.providers.JsonRpcProvider(config.ganache.httpurl);
const wallet1 = new Ethers.Wallet(config.wallet.address01.privateKey,ethers);
const wallet2 = new Ethers.Wallet(config.wallet.address02.privateKey,ethers);

//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.ganache.genToken, genTokenABI, ethers);
//Instantiating a contract with wallet for RW transactions
const genTokenRW = new Ethers.Contract(config.ganache.genToken, genTokenABI, wallet1);


//Getting balance for ERC20 token
async function getBalance(addressForBalance) {
    const balance = await genToken.balanceOf(addressForBalance);
    const formattedResult = Ethers.utils.formatUnits(balance,"ether");  
    console.log('Balance of address',addressForBalance, 'is : ',formattedResult);
}

//Getting approval for ERC20 token
async function getApproval(owner, spender){
    var approval = await genToken.allowance(owner,spender);
    const formattedResult = Ethers.utils.formatUnits(approval,"ether");
    console.log('The amount approved by ',owner,' for ',spender,'is',formattedResult);

    return approval;
}

async function approve(spender,approvalAmount){
    const formattedResult = Ethers.utils.parseEther(approvalAmount);
    console.log(formattedResult);
    const approval = await genTokenRW.approve(spender,formattedResult);    
    console.log('The approval status is',approval);
}

async function transfer(recepient,transferAmount){
    const transferAmountFormatted = Ethers.utils.parseEther(transferAmount);
    const transfer = await genTokenRW.transfer(recepient, transferAmountFormatted);
    console.log('The log for transfer of the amount is:', transfer);
}

async function transferFrom(owner,recepient,transferAmount){
    const transferAmountFormatted = Ethers.utils.parseEther(transferAmount);
    const transfer = await genTokenRW.transferFrom(owner, recepient, transferAmountFormatted);
    console.log('The log for transfer of the amount is:', transfer);
}

getBalance(config.wallet.address01.publicKey);

//approve ('0x0Bf0Ef8F21D9165f5806F8777694Db8ad513D9bF', "20.0");

//getApproval(config.wallet.address03.publicKey,'0x0Bf0Ef8F21D9165f5806F8777694Db8ad513D9bF');

//transfer(config.wallet.address02.publicKey, "1000");

//transferFrom(config.wallet.address01.publicKey, config.wallet.address03.publicKey, "0.05");