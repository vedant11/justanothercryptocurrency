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
}

module.exports = { TransactionPool };
