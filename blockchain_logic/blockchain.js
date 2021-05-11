const { REWARD_INPUT, MINING_REWARD } = require('../config');
const { Transaction } = require('../wallet/transaction');
const { Wallet } = require('../wallet/wallet');
const Block = require('./block');

class Blockchain {
	constructor() {
		// Array of `Block`s
		this.chain = [];

		const genesisBlock = Block.genesis();
		this.chain.push(genesisBlock);
	}
	addBlock({ data }) {
		// data is an array of transactions for crypto implementation on blockchain
		const newBlock = Block.mineBlock({
			lastBlock: this.chain[this.chain.length - 1],
			data,
		});
		this.chain.push(newBlock);
	}

	replaceChain(newChain, callback) {
		if (this.chain.length >= newChain.chain.length) {
			console.error(`length isn't valid for replacement `);
			return;
		}
		if (!Blockchain.isValidBlockchain(newChain)) {
			console.error(`new chain is invalid`);
			return;
		}

		if (!this.validTransactionData({ chain: newChain })) return;

		console.log('calling callback and replacing chain');
		if (callback) callback();
		this.chain = newChain['chain'];
		return;
	}

	static isValidBlockchain(blockchain) {
		const blocks = blockchain.chain;
		// checking if genesis block is valid
		// Using JSON stingify to avoid instance ref comparision
		if (JSON.stringify(blocks[0]) !== JSON.stringify(Block.genesis()))
			return false;
		let lastHash = blocks[0].hash;
		let lastDifficulty = blocks[0].difficulty;
		blocks.shift(); // deletes first elem
		for (let index = 0; index < blocks.length; index++) {
			const block = blocks[index];
			if (block.lastHash !== lastHash) return false;
			lastHash = block.hash;
			if (Block.hashIsValid(block) === false) return false;
			// to prevent large jumps in difficulty levels
			if (Math.abs(block.difficulty - lastDifficulty) > 1) return false;
			lastDifficulty = block.difficulty;
		}
		return true;
	}
	validTransactionData({ chain }) {
		for (let index = 1; index < chain.length; index++) {
			const block = chain[index];
			let mineRewardsCount = 0;
			const transactionSet = new Set();
			for (let j = 0; j < block.data.length; j++) {
				const transaction = block.data[j];

				if (transaction.input.address === REWARD_INPUT.address) {
					// invalid if present more than once
					if (mineRewardsCount) return false;
					mineRewardsCount += 1;

					// to see if `MINING_REWARD` is tampered
					if (
						Object.values(transaction.outputMap)[0] !==
						MINING_REWARD
					)
						return false;
				} else {
					if (
						!Transaction.validTransaction({
							transaction: transaction,
						})
					)
						return false;
					const actualBalance = Wallet.calculateBalance({
						chain: this.chain,
						address: transaction.input.address,
					});

					if (transaction.input.amount !== actualBalance)
						return false;

					if (transactionSet.has(transaction)) return false;
					else transactionSet.add(transaction);
				}
			}
		}
		return true;
	}
}

module.exports = Blockchain;
