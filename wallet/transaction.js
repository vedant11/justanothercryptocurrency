const { v4: uuidv4 } = require('uuid');
const { verifySign } = require('../util/elliptic');
class Transaction {
	constructor({ senderWallet, recipient, amount }) {
		this.id = uuidv4();
		this.outputMap = this.initiateOM({ senderWallet, recipient, amount });
		this.input = this.createInput({
			senderWallet,
			outputMap: this.outputMap,
		});
	}
	initiateOM({ senderWallet, recipient, amount }) {
		const outputMap = {};
		outputMap[recipient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
		return outputMap;
	}
	createInput({ senderWallet, outputMap }) {
		const input = {};
		input['amount'] = senderWallet.balance;
		input['timestamp'] = Number(Date.now());
		input['address'] = senderWallet.publicKey;
		input['signature'] = senderWallet.sign({ data: outputMap });
		return input;
	}
	update({ senderWallet, recipient, amount }) {
		if (amount > this.outputMap[senderWallet.publicKey])
			throw 'Amount exceeds balance';
		if (!this.outputMap[recipient]) this.outputMap[recipient] = amount;
		else this.outputMap[recipient] += amount;
		this.outputMap[senderWallet] -= amount;
		this.input = this.createInput({
			senderWallet,
			outputMap: this.outputMap,
		});
	}
	static validTransaction({ transaction }) {
		const {
			input: { address, amount, signature },
			outputMap,
		} = transaction;
		const outputTotal = Object.values(outputMap).reduce(
			(total, outputAmount) => total + outputAmount
		);
		if (amount !== outputTotal) return false;
		if (
			!verifySign({
				publicKey: address,
				data: outputMap,
				signature: signature,
			})
		)
			return false;
		return true;
	}
}

module.exports = { Transaction };
