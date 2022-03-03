

module.exports = {
    rpc: {
        root: process.env.ROOT_RPC || 'http://localhost:8545',
        child: process.env.MATIC_RPC || 'https://matic-mumbai--jsonrpc.datahub.figment.io/apikey/e108716e948128ba6eab56372b26b0c7/',
    },
    pos: {
        parent: {
            erc20: '0x365f844477D3b2AE1174306DC36AEbA73818b1e7',
            erc721: '0x0C60862e9e44EC28A208AC99e24EA71cA9448132',
        },
        child: {
            erc20: '0x185fb189548a2ac46bf40ab2bd656d8de91b9755',
            erc721: '0xc26ba24c4bfb2e57497c002a032bc353b9723979',
        },
    },
    user1: {
        privateKey: 'a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593',
        address: '0x743937C03780c9490FF93B9c9937591d48017167',
        mnemonic: 'faculty ancient vicious injury forward orange retire satisfy stamp media lonely correct',
    },
    user2: {
        privateKey: 'b963ab577ccdce4598a0a11538b770af47d90cf6c76f3e9a4a3c6928d063ca04',
        address: '0x6cb767C924433b3705B66ba117A84eB972B3611D',
        mnemonic: 'faculty ancient vicious injury forward orange retire satisfy stamp media lonely correct',
    },
    user3: {
        privateKey: 'be9d57920a92ace157837e4945bc96150b6528f58dfb4859aa53247f115a8900',
        address: '0x743937C03780c9490FF93B9c9937591d48017167',
        mnemonic: 'faculty ancient vicious injury forward orange retire satisfy stamp media lonely correct',
    }
}
