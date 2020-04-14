const Lottery = artifacts.require("Lottery");
const Web3 = require('web3');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Contract has a name', async (accounts) => {
  let lottery

  before(async () => {
    lottery = await Lottery.new()
  });

  describe('Lottery', async () => {
    it('Lotter name', async () => {
      let name = await lottery.name()
      assert.equal(name, 'Lottery')
    });

    it('is has a manager_address equal to deployer_address', async () => {
      const manager_address = await lottery.manager.call()
      const deployer_address = accounts[0]

      assert.equal(manager_address, deployer_address, "manager is not deployer")
    });

    it('allow players to enter', async () => {
      const new_player = accounts[1]
      await lottery.enter({ from: new_player, value: web3.utils.toWei('0.02', 'ether')})
      let player = await lottery.players.call('0')

      assert.equal(player, new_player, "new player is not in contract")
    });

    it('allow multiple players to enter', async () => {
      try {
        const new_player2 = accounts[2]
        const new_player3 = accounts[3]

        await lottery.enter({ from: new_player2, value: web3.utils.toWei('0.11', 'ether')})
        let player2 = await lottery.players.call('1')

        await lottery.enter({ from: new_player3, value: web3.utils.toWei('0.003', 'ether')})
        let player3 = await lottery.players.call('2')

        assert.equal(player2, new_player2, "new player2 is not in contract")
        assert.equal(player3, new_player3, "new player3 is not in contract")
      } catch (err) {
        assert(err)
      }
    });

    it('restricts players from selecting winner', async () => {
      try {
        await lottery.pickWinner({ from: accounts[1] })
        assert(false)
      } catch (err) {
        assert(err)
      }
    })

    it('allows manager select winner', async () => {
      await lottery.pickWinner({ from: accounts[0] })
      let balance = String(web3.eth.getBalance(lottery.address).c)

      assert.equal(balance, 'undefined')
    });

    it('sends money to the winner and resets the players array', async () => {
      await lottery.enter({ from: accounts[0], value: web3.utils.toWei('2', 'ether') })

      const initialBalance = await web3.eth.getBalance(accounts[0])

      await lottery.pickWinner({ from: accounts[0] })

      const finalBalancee = await web3.eth.getBalance(accounts[0])
      const differnce = finalBalancee - initialBalance
      assert(differnce > web3.utils.toWei('1.8', 'ether'))
    });
  });
});
