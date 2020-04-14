import React, { Component } from 'react';
import Web3 from 'web3';
import Lottery from '../abis/Lottery.json';

class App extends Component {

  async componentWillMount() {
    await this.loadData();
  }

  async loadData() {
    // Load network id
    const web3 = new Web3(Web3.givenProvider || 'http:localhost8545');
    const networkId = await web3.eth.net.getId();
    console.log(networkId)

    //Fetch accounts
    const accounts = await web3.eth.getAccounts();
    this.setState({ accounts: accounts[0] })
    console.log(accounts[0])

    //Network Data
    const networkData = await Lottery.networks[networkId].address
    console.log(networkData);

    //Fetch SmartContract (ABI & ADDRESS)
    const lottery = new web3.eth.Contract(Lottery.abi, networkData)
    this.setState({ contract: lottery })
    console.log(lottery)

    const manager = await lottery.methods.manager().call()
    this.setState({manager: manager})

    const players = await lottery.methods.getPlayers().call()
    this.setState({players: players})

    const balance = await web3.eth.getBalance(lottery.options.address)
    this.setState({balance : web3.utils.fromWei(balance, 'ether')})
  }

  constructor(props) {
    super(props);
    this.state = {
      manager: '',
      accounts: [],
      players: [],
      balance: '',
      value: '',
      contract: '',
      message: ''
    }
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const web3 = new Web3(Web3.givenProvider || 'http:localhost8545');
    const allAccounts = await web3.eth.getAccounts()

    this.setState({ message: 'Waiting on transaction submition...'})

    await this.state.contract.methods.enter().send({
      from: allAccounts[0], value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered!'})
  }

  onClick = async () => {
    //const web3 = new Web3(Web3.givenProvider || 'http:localhost8545');
    //const allAccounts = await web3.eth.getAccounts()

    this.setState({ message: 'Waiting on transaction success...'})

    await this.state.contract.methods.pickWinner().send({
      from: this.state.manager
    })

    this.setState({ message: 'A winner has been picked'})
  }

  render() {
    return (
      <div>
        <h1> Lottery Contract</h1>
        <p>This contract is managed by {this.state.manager}</p>
        <p>There are currently {this.state.players.length} players into the lottery, competing to win {this.state.balance} ethers!</p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>
        <hr />
        <h3>{this.state.message}</h3>
        <hr />
          <h4>Ready to pick a winner?</h4>
          <button onClick={this.onClick}>Pick winner</button>
      </div>
    );
  }
}

export default App;
