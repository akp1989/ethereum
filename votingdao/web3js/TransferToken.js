const contractABI = require('./library/transferTokenABI');
const contractBC = require('./library/transferTokenByteCode');
const transferContractABI = require('./library/transferTokenABI.json')
const Ethers = require("ethers");
const Web3 = require("web3");
const config = require('./library/config');


const ethersProvider = new Ethers.providers.JsonRpcProvider(config.ganache.httpurl); 
const wallet1 = new Ethers.Wallet(config.wallet.address01.privateKey,ethersProvider);


 
const transferToken = new Ethers.ContractFactory(contractABI, contractBC, wallet1);

async function deploy(transferAmount,receiver,daoAddress,treasuryAddress,daoTokenAddress) {
  console.log(`Attempting to deploy from account: ${wallet1.address}`);
  const contract = await transferToken.deploy(transferAmount, receiver, daoAddress, treasuryAddress,daoTokenAddress,{gasLimit : 1000000});
  await contract.deployed();
  var approveResponse = await approve(contract.address);
  var deployResponse = {};
  deployResponse['address'] = contract.address;
  deployResponse['hash1'] = contract.deployTransaction.hash;
  deployResponse['hash2'] = approveResponse.hash;
  console.log(deployResponse);
}

async function approve(contractAddress){

  const transfer = new Ethers.Contract(contractAddress, transferContractABI, ethersProvider); 
  const transferRW = new Ethers.Contract(contractAddress, transferContractABI, wallet1);
  var transactionResult = await transferRW.approve(10, {
                                                                      gasLimit : 100000
                                                                  });
  return transactionResult;
}

async function balance(contractAddress){

  const transfer = new Ethers.Contract(contractAddress, transferContractABI, ethersProvider);  
  var transactionResult = {};
  var balance = await transfer.balanceOf();
  var allowance = await transfer.allowance();
  transactionResult['balance'] = balance;
  transactionResult['allowance'] = allowance;
  console.log(transactionResult);
}


// deploy(10,
//         '0x6cb767C924433b3705B66ba117A84eB972B3611D', // receiver
//         '0xF5cb7E20a01184b02BeC1ffF3Fb1c2B915932598', // votingAddress
//         '0x62EbA67aA025aCC3aD217E8E477Ae6bF9d532C3D', // treasuryAddress
//         '0x2B568cb02d3D09214d6CCe6d3217CFFA3A8751bD') // gentoken address  

balance('0xee31ba18Ee98fC55A2d135DD6Eba2d516bd0ca83');