const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const VotingParam = artifacts.require('VotingParam');

module.exports = async function(deployer){
    const instance = await deployProxy(VotingParam,
                                        [20,
                                         10,
                                         5,
                                         "0x3E2e31A7Ca94262B140610cF173300005f8ec124"],
                                        {from:'deployer',
                                         initializer:'initialize'});
    console.log('Voting param proxy instance deployed at :',instance.address);
}