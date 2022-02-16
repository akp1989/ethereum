const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');


const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);

//Instantiating a contract with providers for read transactions
const runNFT = new Ethers.Contract(config.goerli.erc721, runNFTABI, ethers);

module.exports = {


  friendlyName: 'Get name symbol',


  description: '',


  inputs: {

  },


  exits: {
    success:{
      statusCode:200,
    },
  },


  fn: async function (inputs,exits) {

    var tokenName = await runNFT.name();
    var tokenSymbol = await runNFT.symbol();
    //return exits.success({message:"Success post response"});
    return exits.success ({ 'name': tokenName,'symbol':tokenSymbol});

  }


};
