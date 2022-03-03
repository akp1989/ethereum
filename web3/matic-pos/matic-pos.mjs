import pkgConfig from './config.js'
import HDWalletProvider from '@truffle/hdwallet-provider'
import pkgMatic from "@maticnetwork/maticjs"
import maticjsWeb3 from "@maticnetwork/maticjs-web3"

const {user1, rpc, pos} = pkgConfig
const {POSClient,use} = pkgMatic
const {Web3ClientPlugin} = maticjsWeb3
 

use(Web3ClientPlugin);

const from = user1.address;
const privateKey = user1.privateKey;
const posClient = new POSClient();
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
                                      

module.exports.testing = async() =>   {
 
  await posClient.init({
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
 
    //posRootChainManager: config.root.POSRootChainManager,
    //posERC20Predicate: config.root.posERC20Predicate, // optional, required only if working with ERC20 tokens
    //posERC721Predicate: config.root.posERC721Predicate, // optional, required only if working with ERC721 tokens
    //posERC1155Predicate: config.root.posERC1155Predicate, // optional, required only if working with ERC71155 tokens
    //parentDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
    //maticDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
  });

}
