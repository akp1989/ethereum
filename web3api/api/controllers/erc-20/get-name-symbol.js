const Ethers = require("ethers");
var genTokenABI = require('./library/genTokenABI');
const config = require('./library/config');


const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);

//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.polygon.erc20, genTokenABI, ethers);

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

    var tokenName = await genToken.name();
    var tokenSymbol = await genToken.symbol();
    //return exits.success({message:"Success post response"});
    return exits.success ({ 'name': tokenName,'symbol':tokenSymbol});

  }


};
