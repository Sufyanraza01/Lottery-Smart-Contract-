require('babel-register');
require('babel-polyfill');

require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://rinkeby.infura.io/${process.env.INFURA_API_KEY}`
         )
      },
      gasPrice: 550000000000,
      network_id: 4
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
  }
},


  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
