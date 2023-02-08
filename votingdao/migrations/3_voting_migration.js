const { deployProxy,upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const Voting = artifacts.require('StorageVote');
const SubmitProposal = artifacts.require('SubmitProposal');
const SubmitVote = artifacts.require('SubmitVote');
const ProcessProposal = artifacts.require('ProcessProposal');
const GenToken = artifacts.require('GenToken');

const localdeployer = '0x8FaF48F45082248D80aad06e76d942f8586E6Dcd';
const maticdeployer = '0x743937C03780c9490FF93B9c9937591d48017167';
module.exports = async function (deployer) {
  const genToken = await GenToken.deployed();
  
  const submitProposal = await deployer.deploy(SubmitProposal);
  const submitVote = await deployer.deploy(SubmitVote);
  const processProposal = await deployer.deploy(ProcessProposal);
  const voting = await deployer.deploy(Voting, 
                                        localdeployer,
                                        300,
                                        3,
                                        10,
                                        0,
                                        true,
                                        genToken.address,
                                        submitProposal.address,
                                        submitVote.address,
                                        processProposal.address);

  // const voting = await deployProxy(Voting,
  //                                   [ localdeployer,
  //                                     60,
  //                                     3,
  //                                     10,
  //                                     0,
  //                                     true,
  //                                     genToken.address,
  //                                     submitProposal.address,
  //                                     submitVote.address,
  //                                     processProposal.address
  //                                   ],
  //                                   {from:localdeployer,kind : "uups"}
  //                                   );
  console.log('GenToken deployed at : ', genToken.address);
  console.log('Submit Proposal deployed at : ', submitProposal.address);
  console.log('Submit Vote deployed at : ', submitVote.address);
  console.log('Process Proposal deployed at : ', processProposal.address);
  console.log('Voting deployed at : ', voting.address);

}


  

