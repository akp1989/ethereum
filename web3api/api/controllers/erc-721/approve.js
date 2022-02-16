const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);
const wallet = new Ethers.Wallet(config.wallet.privateKey01,ethers);


//Instantiating a contract with providers for read transactions
const runNFTRW = new Ethers.Contract(config.goerli.erc721, runNFTABI, wallet)

module.exports = {


  friendlyName: 'Get balance',


  description: '',


  inputs: {
    address: {
      type: 'string',
      required: true,
    },
    tokenID: {
      type: 'string',
      required: true,
    },
  },


  exits: {
    success:{
      statusCode:200,
    },
  },


  fn: async function (inputs,exits) {
    const approval = await runNFTRW.approve(inputs.address,inputs.tokenID);
    return exits.success({'approvalLog': approval});
    //return exits.success ({ 'tokenID': inputs.tokenID,'owner':wallet.getAddress(),'approved for ':address});
  }


};
