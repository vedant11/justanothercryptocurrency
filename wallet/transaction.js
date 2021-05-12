const { v4: uuidv4 } = require('uuid');
const { verifySign } = require('../util/elliptic');
const { MINING_REWARD, REWARD_INPUT } = require('../config');
class Transaction {
	constructor({ senderWallet, recipient, amount, outputMap, input }) {
		this.id = uuidv4();
		this.outputMap =
			outputMap || this.initiateOM({ senderWallet, recipient, amount });
		this.input =
			input ||
			this.createInput({
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
			throw new Error('Amount exceeds balance');
		if (!this.outputMap[recipient]) this.outputMap[recipient] = amount;
		else this.outputMap[recipient] += amount;
		this.outputMap[senderWallet.publicKey] -= amount;
		this.input = this.createInput({
			senderWallet,
			outputMap: this.outputMap,
		});
	}
	static validTransaction({ transaction }) {
		// console.log('transaction', transaction['outputMap']);
		const { input, outputMap } = transaction;
		// console.log('input', input);
		const { address, amount, signature } = input;
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
	static rewardTransaction({ minerWallet }) {
		// we want hardcoded outputMap and inputs
		return new Transaction({
			input: REWARD_INPUT,
			outputMap: {
				[minerWallet.publicKey]: MINING_REWARD,
			},
		});
	}
}

module.exports = { Transaction };
