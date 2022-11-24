const HDWalletProvider = require("@truffle/hdwallet-provider");
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
	    from:'0x8FaF48F45082248D80aad06e76d942f8586E6Dcd' 
    },
    goerli: {
        provider: () => new HDWalletProvider({privateKeys: ['a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593'], 
                                              providerOrUrl: `wss://eth-goerli.g.alchemy.com/v2/5c7PbtFdZb33cgRV0qFsqo7Ge-OJuj9o`}),
                                              //providerOrUrl: `https://sepolia.infura.io/v3/5b7df9e925c0427ea871dcd5fcb45cf5`}),
                                              //providerOrUrl: `http://localhost:9545`}),
                                              
        network_id: 5,
        //network_id: 11155111,
        // gas:30000000,
        // // gas: 4500000,
        // gasPrice: 10000000000,
        // confirmations:2,
        networkCheckTimeout: 1000000,
        // timeoutBlocks: 200,
        // skipDryRun: true,
        // from:"0x743937C03780c9490FF93B9c9937591d48017167" 
    },
    matic: {
      provider: () => new HDWalletProvider({privateKeys: ['a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593'], 
                                            providerOrUrl: `https://rpc-mumbai.maticvigil.com/v1/e2eb64e5292b40809a540f45ff9fea3d78d7f4cc`}),
      network_id: 80001,
      //confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: "^0.8.9",
      // docker: "true",
      // settings: {
      //   optimizer : {
      //     enabled : true,
      //     runs : 1000000
      //   }
      // }
      
    }
  }
};