import pkgMatic from "@maticnetwork/maticjs"
import pkgMaticPlasma from "@maticnetwork/maticjs-plasma"
import pkgMaticWeb3 from '@maticnetwork/maticjs-web3'
import HDWalletProvider from '@truffle/hdwallet-provider'

import pkgConfig from './config.js'
 
const {POSClient,use} = pkgMatic
const { PlasmaClient } = pkgMaticPlasma
const Web3ClientPlugin = pkgMaticWeb3
const {root,child,user} = pkgConfig

use(Web3ClientPlugin);

const posClient = new POSClient();
const plasmaClient = new PlasmaClient();

let parentProvider = new HDWalletProvider({
                                            mnemonic: {
                                              phrase: user.mnemonic
                                            },
                                            providerOrUrl: root.RPC,
                                            pollingInterval: 8000
                                          });
let childProvider = new HDWalletProvider({
                                            mnemonic: {
                                              phrase: user.mnemonic
                                            },
                                            providerOrUrl: child.RPC,
                                            pollingInterval: 8000
                                          });
                                      

async function getPOSClient (network = 'testnet', version='mumbai') {

  console.log ("test")
  console.log(user.privateKey)

  return posClient.init({
    network: network, // optional, default is testnet
    version: version, // optional, default is mumbai
    parent:{
      Provider: parentProvider,
      defaultConfig: {
        from: user.address
      }
    },
    child:{
      Provider: childProvider,
      defaultConfig: {
        from: user.address
      }
    },
    //posRootChainManager: config.root.POSRootChainManager,
    //posERC20Predicate: config.root.posERC20Predicate, // optional, required only if working with ERC20 tokens
    //posERC721Predicate: config.root.posERC721Predicate, // optional, required only if working with ERC721 tokens
    //posERC1155Predicate: config.root.posERC1155Predicate, // optional, required only if working with ERC71155 tokens
    //parentDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
    //maticDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
  });
}


async function getPlasmaClient (network = 'testnet', version = 'mumbai') {
  try {
    const plasmaClient = new PlasmaClient()
    return plasmaClient.init({
      network: network,
      version: version,
      parent:{
        Provider: parentProvider,
        defaultConfig: {
          from: user.address
        }
      },
      child:{
        Provider: childProvider,
        defaultConfig: {
          from: user.address
        }
      },
    })
  } catch (error) {
    console.error('error unable to initiate plasmaClient', error)
  }
}

getPOSClient().then(()=>process.exit(0))
getPlasmaClient().then(()=>process.exit(0))