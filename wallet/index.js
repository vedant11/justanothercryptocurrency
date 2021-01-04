const { STARTING_BALANCE } = require('../config');
const { ec } = require('../util/elliptic');
const cryptoHash = require('../blockchain_logic/crypto-hash');
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

module.exports = Wallet;
