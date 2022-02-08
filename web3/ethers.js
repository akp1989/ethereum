const genTokenABI = require('./library/genTokenABI');
const Ethers = require("ethers");

const privateKey01 = ("a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593").toString('hex');
const privateKey02 = ("b963ab577ccdce4598a0a11538b770af47d90cf6c76f3e9a4a3c6928d063ca04").toString('hex');

//Defining the etheres connection and provider
const httpsUrl = "http://127.0.0.1:8545";
const httpPolygonURL = "https://matic-mumbai--jsonrpc.datahub.figment.io/apikey/e108716e948128ba6eab56372b26b0c7/";
const ethers = new Ethers.providers.JsonRpcProvider(httpPolygonURL);
const wallet = new Ethers.Wallet(privateKey01,ethers);
const wallet1 = new Ethers.Wallet(privateKey02,ethers);
 
//Address details
const tokenAddress = "0x365f844477D3b2AE1174306DC36AEbA73818b1e7";
const tokenAddressMumbai = "0x185fb189548a2ac46bf40ab2bd656d8de91b9755";
const ownerAddress = "0x743937C03780c9490FF93B9c9937591d48017167";
const spenderAddress = "0x6cb767C924433b3705B66ba117A84eB972B3611D";
     
//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(tokenAddressMumbai, genTokenABI, ethers);
//Instantiating a contract with wallet for RW transactions
//const genTokenRW = new Ethers.Contract(tokenAddressMumbai, genTokenABI, wallet);
const genTokenRW = new Ethers.Contract(tokenAddressMumbai, genTokenABI, wallet1);
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
async function getBalance() {
    const addressForBalance = await wallet.getAddress();
    const balance = await genToken.balanceOf(addressForBalance);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = Ethers.utils.formatUnits(balance,"ether");
    console.log('Balance of address',addressForBalance, 'is : ');
    console.log(formattedResult);
}

//Getting approval for ERC20 token
async function getApproval(){
    const ownerAddress = await wallet.getAddress();
    var approval = await genToken.allowance(ownerAddress,spenderAddress);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = Ethers.utils.formatUnits(approval,"ether");
    console.log('The amount approved by ',ownerAddress,' for ',spenderAddress,'is',formattedResult);
    return approval;
}

async function approve(){
    //parseUnits will take the given number and convert it to the mentioned unit
    const approvalAmount = await Ethers.utils.parseUnits("1.0", "ether");
    const approval = await genTokenRW.approve(spenderAddress,approvalAmount);
    console.log('The approval status is',approval);
}

async function transfer(){
    const recepient = '0xB007C0c163620356E84552bC2A5cb8D454F44bde';
    var transferAmount = Ethers.utils.parseUnits(0.49.toString(),'ether');
    const transfer = await genTokenRW.transfer(recepient, transferAmount);
    console.log('The log for transfer of the amount is:', transfer);
}

async function transferFrom(){
    const recepient = '0xB007C0c163620356E84552bC2A5cb8D454F44bde';
    var transferAmount = Ethers.utils.parseUnits(0.49.toString(),'ether');
    console.log(transferAmount)
    var approvedAmount = await getApproval();
    var gasLimit = await getFeeData();
    if(transferAmount.gt(approvedAmount))
    {   console.log('Not approved');
        return false;
    }
    console.log('Proceeding with transfer');
    const transfer = await genTokenRW.transferFrom(ownerAddress, recepient, transferAmount,{
        gasLimit:100000
    });
    console.log('The log for transfer of the amount is:', transfer);
}
//getBlockNumber();
//getFeeData();
getBalance();
//approve();
//getApproval();
transferFrom();
