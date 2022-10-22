const { deployProxy,upgradeProxy } = artifacts.require('@openzeppelin/truffle-upgrades');

const Voting = artifacts.require('Voting');

module.exports = async function (deployer) {
  const instance = await deployProxy(Voting, 
                                    [deployer,
                                     periodDuration,
                                     votingPeriodLength,
                                     proposalDeposit,
                                     tokenTribute,
                                     processingReward,
                                     quadraticMode,
                                     daoTokenAddress], 
                                    { deployer });
  console.log('Deployed', instance.address);
};

module.exports = async function (deployer) {
  const presentVoting = await Voting.deployed();
  const instance = await upgradeProxy(existing.address, BoxV2, { deployer });
  console.log("Upgraded", instance.address);
};