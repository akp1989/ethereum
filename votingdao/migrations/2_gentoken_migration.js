const { deploy } = require('@openzeppelin/truffle-upgrades/dist/utils');
const GenToken = artifacts.require('Gentoken');
const localdeployer = '0x8FaF48F45082248D80aad06e76d942f8586E6Dcd';
const maticdeployer = '0x743937C03780c9490FF93B9c9937591d48017167';
const Ethers = require("ethers");


module.exports = async function (deployer) {
 
  const instance = await deployer.deploy(GenToken, 
                                             Ethers.utils.parseEther("10000000"));
                                    
 
}


  

