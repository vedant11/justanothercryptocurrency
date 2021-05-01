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
		return Object.values(this.transactionsMap).filter((transaction) =>
			Transaction.validTransaction({ transaction })
		);
	}
}

module.exports = { TransactionPool };
