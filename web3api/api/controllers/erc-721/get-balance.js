const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);

//Instantiating a contract with providers for read transactions
const runNFT = new Ethers.Contract(config.goerli.erc721, runNFTABI, ethers)

module.exports = {


  friendlyName: 'Get balance',


  description: '',


  inputs: {
    addressForBalance: {
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
    const balance = await runNFT.balanceOf(inputs.addressForBalance);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = balance.toNumber();
    return exits.success ({ 'address':inputs.addressForBalance,'Balance of address ':formattedResult});
  }


};
