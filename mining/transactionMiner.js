const { Transaction } = require('../wallet/transaction');

class TransactionMiner {
	constructor({ blockchain, transactionPool, wallet, pubsub }) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubsub = pubsub;
	}

	mineTransaction() {
		// fetchValidTransactions()
		const validTransactions = this.transactionPool.fetchValidTransactions();

		// generate miner's reward: transactionPool.addTransaction(Transaction.rewardTransaction())
		const rewardTransaction = Transaction.rewardTransaction({
			minerWallet: this.wallet,
		});
		// push to the validTransactions array
		validTransactions.push(rewardTransaction);

		// add a block consisting of these transactions to this.blockchain
		this.blockchain.addBlock({ data: validTransactions });

		// broadcast the updated blockchain
		this.pubsub.broadcastBlockchain();

		// clear the local TransactionPool, as all the transactions have been added
		this.transactionPool.clear();
	}
}
