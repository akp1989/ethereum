const Ethers = require("ethers");
var genTokenABI = require('./library/genTokenABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);


//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.polygon.erc20, genTokenABI, ethers);
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
    const balance = await genToken.balanceOf(inputs.addressForBalance);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = Ethers.utils.formatUnits(balance,"ether");
    return exits.success ({ 'address':inputs.addressForBalance,'Balance of address ':formattedResult});
  }


};
