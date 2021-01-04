const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util/elliptic');
class Wallet {
	constructor() {
		this.balance = STARTING_BALANCE;
		this.keyPair = ec.genKeyPair();
		this.publicKey = this.keyPair.getPublic();
	}
	sign({ data }) {
		// generates suitable by cryptoHash
		return this.keyPair.sign(cryptoHash(data));
	}
}

module.exports = { Wallet };
