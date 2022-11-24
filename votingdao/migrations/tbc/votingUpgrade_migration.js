const { deployProxy,upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const Voting = artifacts.require('Voting');
const devDeployer = '0x8FaF48F45082248D80aad06e76d942f8586E6Dcd';
const testDeployer = '0x743937C03780c9490FF93B9c9937591d48017167';


module.exports = async function (deployer) {
    //const existingaddress =  "0xfbE1Ff1665C7115A4166072507E8A686Bd1b0A54";
    const presentVoting = await Voting.deployed();
    console.log("The current address of proxy:",presentVoting.address);
    const instance = await upgradeProxy(presentVoting, Voting, { from:testDeployer/*, kind:"uups" */});
    console.log("Upgraded", instance.address);
}