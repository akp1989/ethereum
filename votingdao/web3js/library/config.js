module.exports = {
 
    ganache:{
        httpurl : "http://127.0.0.1:8545",
        genToken: "0x578e2F6fc640Cc165536F0B1bEa7795d772461D4",
        voting : "0x519E9851b4375340EAC2C96c121aE735DB780a2e"      
    },
    matic:{
        httpurl : "https://rpc-mumbai.maticvigil.com/v1/e2eb64e5292b40809a540f45ff9fea3d78d7f4cc",
        genToken : "0x45eb38939d6e26a675cbb9ac797B0399Fa8448E3",
        voting : "0xF32573c4C864931Eb06Cc639Cf8E23F17CBFEdcA",
        treasury : "0x8f5214f371a283b82D3732F1f514A73C5B8f61e2",
    },
    wallet:{
        address01: {
            publicKey: "0x8FaF48F45082248D80aad06e76d942f8586E6Dcd",
            privateKey : ("ae2e4341251159be1c7bae03b9a81e56c35c0660fe14114e2d6fc0a0c8c441c6").toString('hex')
        },
        address02: {
            publicKey: "0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2",
            privateKey : ("664b1b66d4b5eee1666a49b89d3f9b17227b257137007fab44aae071055c7b64").toString('hex')

        },
        address03:{
            publicKey: "0x4Ad1d05111ee1C69cD47CECde922d08B3E9b6044",
            privateKey : ("3b033e1d482030cc884514e0a2960b58e04de059454e0a39bb9bdbfe064611d9").toString('hex')
        } 
    },
    walletMeta:{
        address01: {
            publicKey : "0x743937C03780c9490FF93B9c9937591d48017167",
            privateKey : "a05ffe50146ea28df6b034213c0bd2e32b89e9606c7d90320a8a9800a0cdc593"
        }
    }
}