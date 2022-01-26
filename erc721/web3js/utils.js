const { MaticPlasmaClient } = require('@maticnetwork/maticjs-plasma')
const { use,MaticPOSClient } = require('@maticnetwork/maticjs')
const web3ClientPlugin = require('@maticnetwork/maticjs-web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')

const config = require('./config')
use(web3ClientPlugin)

async function getPOSClient (network = 'testnet', version='mumbai') {
  const maticPOSClient = new MaticPOSClient();
  return maticPOSClient.init({
    network: network, // optional, default is testnet
    version: version, // optional, default is mumbai
    parent:{
      Provider: new HDWalletProvider(config.user.privateKey, config.root.RPC),
      defaultConfig: {
        from: config.user.address
      }
    },
    child:{
      Provider: new HDWalletProvider(config.user.privateKey, config.child.RPC),
      defaultConfig: {
        from: config.user.address
      }
    }, 
    //posRootChainManager: config.root.POSRootChainManager,
    //posERC20Predicate: config.root.posERC20Predicate, // optional, required only if working with ERC20 tokens
    //posERC721Predicate: config.root.posERC721Predicate, // optional, required only if working with ERC721 tokens
    //posERC1155Predicate: config.root.posERC1155Predicate, // optional, required only if working with ERC71155 tokens
    //parentDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
    //maticDefaultOptions: { from: config.user.address }, // optional, can also be sent as last param while sending tx
  })
}

async function getPlasmaClient (network = 'testnet', version = 'mumbai') {
  try {
    const plasmaClient = new MaticPlasmaClient()
    return plasmaClient.init({
      network: network,
      version: version,
      parent: {
        provider: new HDWalletProvider(config.user.privateKey, config.root.RPC),
        defaultConfig: {
          from
        }
      },
      child: {
        provider: new HDWalletProvider(config.user.privateKey, config.child.RPC),
        defaultConfig: {
          from
        }
      }
    })
  } catch (error) {
    console.error('error unable to initiate plasmaClient', error)
  }
}
