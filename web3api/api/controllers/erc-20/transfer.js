const Ethers = require("ethers");
var genTokenABI = require('./library/genTokenABI');
const config = require('./library/config');


const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);
const wallet = new Ethers.Wallet(config.wallet.privateKey01,ethers);


//Instantiating a contract with providers for read transactions
const genTokenRW = new Ethers.Contract(config.polygon.erc20, genTokenABI, wallet);

module.exports = {


  friendlyName: 'Transfer',


  description: 'Transfer erc 20.',


  inputs: {
    recepient: {
      type: 'string',
      required: true,
    },
    amount: {
      type: 'string',
      required: true,
    },
  },


  exits: {
    success:{
      statuscode:200,
    }
  },


  fn: async function (inputs,exits) {
    var transferAmount = Ethers.utils.parseUnits(inputs.amount,'ether');
    const transfer = await genTokenRW.transfer(inputs.recepient, transferAmount);
    return exits.success({'sender': await wallet.getAddress(),'receiver':inputs.recepient,'amount':inputs.amount,'hash':transfer.hash});

  }


};
