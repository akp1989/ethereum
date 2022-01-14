const HDWalletProvider = require("@truffle/hdwallet-provider");
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
	  from:"0xF113557f6C46733Fa8011414868a83F7A91a6e36"
	  //from:"0xe3770c2BE3AA920424ecb24Fa618f7194E306A3e"
    }
//	rinkeby: {
//        provider: () => new HDWalletProvider(`YOUR_SEED_PHRASE`, `https://rinkeby.infura.io/v3/b63bffeec2e545f2a3e9b3e9423d6180`),
//        network_id: 4,
//       gas: 5500000,
//		confirmations:2,
//		timeoutBlocks: 200,
//		skipDryRun: true,
//       gasPrice: 10000000000
//    }
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};