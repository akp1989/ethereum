const Ethers = require("ethers");
var genTokenABI = require('./library/genTokenABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.polygon.httpurl);

//Instantiating a contract with providers for read transactions
const genToken = new Ethers.Contract(config.polygon.erc20, genTokenABI, ethers);

module.exports = {


  friendlyName: 'Get approval',


  description: '',


  inputs: {
    owner: {
      type: 'string',
      required: true,
    },
    spender: {
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
    var approval = await genToken.allowance(inputs.owner,inputs.spender);
    //formatUnits take the big number and formats it to the mentioned unit
    const formattedResult = Ethers.utils.formatUnits(approval,"ether");
    // All done.
    return exits.success ({ 'owner':inputs.owner,'spender ':inputs.spender,'approvedAmount':formattedResult});

  }


};
