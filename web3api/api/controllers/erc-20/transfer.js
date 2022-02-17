const Ethers = require("ethers");
var genTokenABI = require('./library/genTokenABI');
const config = require('./library/config');


const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);

//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.polygon.erc20, genTokenABI, ethers);

module.exports = {


  friendlyName: 'Transfer',


  description: 'Transfer erc 20.',


  inputs: {
    sender:{
      type: 'string',
      required: true,
    },
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
    const signer = new Ethers.Wallet(config.wallet[inputs.sender].privateKey,ethers);
    var transferAmount = Ethers.utils.parseUnits(inputs.amount,'ether');
    const transfer = await genToken.connect(signer).transfer(inputs.recepient, transferAmount);
    return exits.success({'sender': await signer.getAddress(),'receiver':inputs.recepient,'amount':inputs.amount,'hash':transfer.hash});

  }


};
