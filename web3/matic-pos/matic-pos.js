const { use, POSClient } = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { user1,user2,user3, rpc, pos } = require("./config");

use(Web3ClientPlugin);

const from = user1.address;
const privateKey = user1.privateKey;

let parentProvider = new HDWalletProvider({
    // mnemonic: {
    //   phrase: user1.mnemonic
    // },
    privateKeys : [privateKey],
    providerOrUrl: rpc.root,
    pollingInterval: 8000
  });
let childProvider = new HDWalletProvider({
    // mnemonic: {
    //   phrase: user1.mnemonic
    // },
    privateKeys : [privateKey],
    providerOrUrl: rpc.child,
    pollingInterval: 8000
  });

module.exports.getPOSClient = async () => {

    const matic = new POSClient();
    return await matic.init({
        // log: true,
        network: 'testnet',
        version: 'mumbai',
        parent: {
            provider: parentProvider,
            defaultConfig: {
                from
            }
        },
        child: {
            provider: childProvider,
            defaultConfig: {
                from
            }
        }
    });

    const rootTokenErc20 = matic.erc20(pos.parent.serc20, true);

    const balanceRoot = await rootTokenErc20.getBalance(from)
    console.log('balanceRoot', balanceRoot);
}

