//const tokenContract = artifacts.require("GenToken");
const walletContract = artifacts.require("Multisign")

module.exports = function (deployer) {
  let address = ['0xF113557f6C46733Fa8011414868a83F7A91a6e36',
                  '0xe3770c2BE3AA920424ecb24Fa618f7194E306A3e',
                  '0xc6761742819e201baB707b969668A75B3ca4b230'];
                 // "0x79545F9a64334e371B22E3b2bC1C91231C589eE8",
                 // "0xbB415DD7ECdb91cbDd29C2e346737BC459f4F58b"];
  //deployer.deploy(tokenContract,"GeneraToken","GNRA",10000);
  deployer.deploy(walletContract,address,2);
};
