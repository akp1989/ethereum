const Ethers = require("ethers");
var genTokenABI = require('./library/genTokenABI');
const config = require('./library/config');


const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);

//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.polygon.erc20, genTokenABI, ethers);

module.exports = {


  friendlyName: 'Approve',


  description: 'Approve ERC20 token to the recepient on behalf of the sender',


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
    var approvedAmount = Ethers.utils.parseUnits(inputs.amount,'ether');
    const approve = await genToken.connect(signer).approve(inputs.recepient, approvedAmount);
    return exits.success({'sender': await signer.getAddress(),'receiver':inputs.recepient,'amount':inputs.amount,'hash':approve.hash});

  }


};
