const { Transaction } = require('./transaction');

class TransactionPool {
	constructor() {
		this.transactionsMap = {};
	}
	addTransaction({ transaction }) {
		this.transactionsMap[transaction.id] = transaction;
	}
	existingTransaction({ inputAddress }) {
		const transactions = Object.values(this.transactionsMap);
		return transactions.find(
			(transaction) => transaction.input.address === inputAddress
		);
	}
	setMap({ transactionsMap }) {
		this.transactionsMap = transactionsMap;
	}
	fetchValidTransactions() {
		// returns an array of transactions
		return Object.values(this.transactionsMap).filter((transaction) =>
			Transaction.validTransaction({ transaction })
		);
	}
	clear() {
		// sets transactionMap to empty dictionary;
		// clears the transactionMap irrespective
		// of whether the transactions have been included in the Blockchain
		this.setMap({ transactionsMap: {} });
	}
	clearBlockchainTransactions({ blockchain }) {
		const chain = blockchain['chain']; // chain array of the blockchain
		chain.forEach((block, index) => {
			if (block.hash === 'hash1') return; // skip the genesis block
			block.data.forEach((transaction) => {
				if (this.transactionsMap[transaction.id]) {
					delete this.transactionsMap[transaction.id];
				}
			});
		});
	}
}

module.exports = { TransactionPool };
