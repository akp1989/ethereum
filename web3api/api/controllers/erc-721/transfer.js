const Ethers = require("ethers");
var runNFTABI = require('./library/RunNFTABI');
const config = require('./library/config');

const ethers = new Ethers.providers.JsonRpcProvider(config.goerli.httpurl);

//Instantiating a contract with providers for read transactions
const runNFT = new Ethers.Contract(config.goerli.erc721, runNFTABI, ethers);

module.exports = {


  friendlyName: 'Transfer the asset to the new owner',


  description: '',


  inputs: {
    sender:{
      type: 'string',
      required: true,
    },
    receiver: {
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
    const signer = new Ethers.Wallet(config.wallet[inputs.sender].privateKey,ethers);
    const transferFrom = await runNFT.connect(signer).transferFrom(await signer.getAddress(),inputs.receiver,inputs.tokenID);
    return exits.success({'Transfer Log': transferFrom});
    //return exits.success ({ 'tokenID': inputs.tokenID,'owner':wallet.getAddress(),'approved for ':address});
  }

};
