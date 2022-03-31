const masterDocumentContract = artifacts.require("MasterDocumentContract")

module.exports = function (deployer) {
  let address = ['0x0Ba26013Be44798F5a8368fC7F5055103a695ecc',
                  '0xFD052a84CA747602E601310a5B166117e7C823c2',
                  '0x69dF5329A3028681FE808eaa20FFD891f3753524'];
  deployer.deploy(masterDocumentContract,address,2);
};
