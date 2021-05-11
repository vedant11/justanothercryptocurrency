const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util/elliptic');
const { Transaction } = require('./transaction');
class Wallet {
	constructor() {
		this.balance = STARTING_BALANCE;
		this.keyPair = ec.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}
	sign({ data }) {
		// generates suitable by cryptoHash
		return this.keyPair.sign(cryptoHash(data));
	}
	createTransaction({ amount, recipient }) {
		if (amount > this.balance)
			throw new Error('Amount exceeded the balance');
		const transaction = new Transaction({
			senderWallet: this,
			recipient,
			amount,
		});
		return transaction;
	}
	static calculateBalance({ chain, address }) {
		let recipientTotal = 0,
			newBalance = 0;
		let senderTransaction = false;

		chain.forEach((block) => {
			if (block.data === 'data') return;

			block.data.forEach((transaction) => {
				const recipientAmount = transaction.outputMap[address];

				// if a user is a sender, there is only one transaction corresponding
				// to it and becomes the newBalance
				// furthermore,
				// if a user is a recipient, the amounts add up to his balance
				if (recipientAmount) recipientTotal += recipientAmount;
				if (transaction.input['address'] === address) {
					newBalance = recipientAmount;
					recipientTotal = 0;
					senderTransaction = true;
				}
			});
		});
		if (senderTransaction) return newBalance + recipientTotal;
		return STARTING_BALANCE + recipientTotal;
	}
}

module.exports = { Wallet };
