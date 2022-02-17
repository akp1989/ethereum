const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);

//Instantiating a contract with providers for read transactions
const runNFT = new Ethers.Contract(config.goerli.erc721, runNFTABI, ethers)

module.exports = {


  friendlyName: 'Get the universal resource idenfier for the given token',


  description: '',


  inputs: {
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
    const uri = await runNFT.tokenURI(inputs.tokenID);

    return exits.success ({ 'tokenID':inputs.tokenID,'token URI ':uri});
  }


};
