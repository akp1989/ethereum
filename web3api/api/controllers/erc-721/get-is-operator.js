const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);

//Instantiating a contract with providers for read transactions
const runNFT = new Ethers.Contract(config.goerli.erc721, runNFTABI, ethers)

module.exports = {


  friendlyName: 'Get IsOperator',


  description: '',


  inputs: {
    owner: {
      type: 'string',
      required: true,
    },
    operator: {
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
    const isOperator = await runNFT.isApprovedForAll(inputs.owner,inputs.operator);
    return exits.success ({ 'owner':inputs.owner,'operator':inputs.operator,'isOperator':isOperator});
  }


};
