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
}

module.exports = { Wallet };
