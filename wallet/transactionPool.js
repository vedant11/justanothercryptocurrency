const { Transaction } = require('./transaction');

class TransactionPool {
	constructor() {
		this.transactionsMap = {};
	}
	addTransaction(transaction) {
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
	clearBlockchainTransactions({ chain }) {
		chain.forEach((block, index) => {
			if (index === 0) return;
			block.data.forEach((transaction) => {
				if (this.transactionsMap[transaction.id])
					delete this.transactionsMap[transaction.id];
			});
		});
	}
}

module.exports = { TransactionPool };
