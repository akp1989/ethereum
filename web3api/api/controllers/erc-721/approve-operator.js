const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);

//Instantiating a contract with providers for read transactions
const runNFT = new Ethers.Contract(config.goerli.erc721, runNFTABI, ethers);

module.exports = {


  friendlyName: 'Approve an operator to operate on behalf of the owner',


  description: '',


  inputs: {
    sender:{
      type: 'string',
      required:true,
    },
    address: {
      type: 'string',
      required: true,
    },
    approved: {
      type: 'boolean',
      required: true,
    },
  },


  exits: {
    success:{
      statusCode:200,
    },
  },


  fn: async function (inputs,exits) {
    const signer = new Ethers.Wallet(config.wallet[inputs.sender].privateKey,ethers);
    const approval = await runNFT.connect(signer).setApprovalForAll(inputs.address,inputs.approved);
    return exits.success({'approvalLog': approval});
    //return exits.success ({ 'tokenID': inputs.tokenID,'owner':wallet.getAddress(),'approved for ':address});
  }


};
