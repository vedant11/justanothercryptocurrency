const { v4: uuidv4 } = require('uuid');

class Transaction {
	constructor({ senderWallet, recipient, amount }) {
		this.id = uuidv4();
		this.outputMap = this.initiateOM({ senderWallet, recipient, amount });
	}
	initiateOM({ senderWallet, recipient, amount }) {
		const outputMap = {};
		outputMap[recipient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
		return outputMap;
	}
}

module.exports = { Transaction };
