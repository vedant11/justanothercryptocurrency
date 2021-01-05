class TransactionPool {
	constructor() {
		this.transactionsMap = {};
	}
	addTransaction(transaction) {
		this.transactionsMap[transaction.id] = transaction;
	}
}

module.exports = { TransactionPool };
