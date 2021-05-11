const Blockchain = require('../blockchain_logic/blockchain');
const Block = require('../blockchain_logic/block');
const { Wallet } = require('../wallet/wallet');
const { Transaction } = require('../wallet/transaction');

describe('Blockchain', () => {
	let newBlockchain, secondBC, originalChain;
	// quieting console for this file
	let errorMock, logMock;
	errorMock = jest.fn();
	logMock = jest.fn();
	global.console.log = logMock;
	global.console.error = errorMock;
	beforeEach(() => {
		// To give every desc block a new instance of blockchain
		newBlockchain = new Blockchain();
		secondBC = new Blockchain();
		originalChain = newBlockchain.chain;
	});
	it('adds new blockchain instance', () => {
		expect(newBlockchain instanceof Blockchain).toBe(true);
	});
	it('has `chain` as an Array instance', () => {
		expect(newBlockchain.chain instanceof Array).toBe(true);
	});
	it('starts with genesis block', () => {
		expect(newBlockchain.chain[0]).toEqual(Block.genesis());
	});
	it('adds new block successfully', () => {
		const newData = 'newdata';
		newBlockchain.addBlock({
			data: newData,
		});
		expect(
			newBlockchain.chain[newBlockchain.chain.length - 1].data
		).toEqual(newData);
	});
	describe('isValidBlockchain()', () => {
		describe('first block is not genesis', () => {
			it('returns false', () => {
				newBlockchain.chain[0] = { data: 'fake-block' };
				expect(Blockchain.isValidBlockchain(newBlockchain)).toBe(false);
			});
		});
		describe('when block has mulitple blocks', () => {
			beforeEach(() => {
				newBlockchain.addBlock({ data: 'Block2' });
				newBlockchain.addBlock({ data: 'Block3' });
				newBlockchain.addBlock({ data: 'Block4' });
			});
			describe('and lastHash of a block has been tampered', () => {
				it('should return false', () => {
					newBlockchain.chain[1].lastHash = 'totally tampered hash';
					expect(Blockchain.isValidBlockchain(newBlockchain)).toBe(
						false
					);
				});
			});
			describe('data of a block has been tampered', () => {
				it('should return false', () => {
					newBlockchain.chain[2].data = 'tampered data';
					expect(Blockchain.isValidBlockchain(newBlockchain)).toBe(
						false
					);
				});
			});
			describe('chain has no invalid blocks', () => {
				it('should return true', () => {
					expect(Blockchain.isValidBlockchain(newBlockchain)).toBe(
						true
					);
				});
			});
		});
	});
	describe('replaceChain()', () => {
		describe('when secondBC is not longer', () => {
			beforeEach(() => {
				secondBC.chain[0] = { new: 'different gen block' };
				newBlockchain.replaceChain(secondBC);
			});
			it('should not be replaced', () => {
				expect(newBlockchain.chain).toEqual(originalChain);
			});
			it('should call error', () => {
				expect(errorMock).toHaveBeenCalled();
			});
		});
		describe('when secondBC is longer', () => {
			beforeEach(() => {
				secondBC.addBlock({ data: 'grow big' });
				secondBC.addBlock({ data: 'grow bigg' });
				secondBC.addBlock({ data: 'grow biggg' });
				secondBC.addBlock({ data: 'grow bigggg' });
			});
			describe('when secondBC is not valid', () => {
				beforeEach(() => {
					secondBC.chain[2].lastHash = 'tampered-last-hash';
					newBlockchain.replaceChain(secondBC);
				});
				it('should not get replaced', () => {
					expect(newBlockchain.chain).toEqual(originalChain);
				});
				it('should log an error', () => {
					expect(errorMock).toHaveBeenCalled();
				});
			});
			describe('when secondBC is valid', () => {
				beforeEach(() => {
					newBlockchain.replaceChain(secondBC);
				});
				it('should get replaced', () => {
					expect(newBlockchain.chain).not.toEqual(originalChain);
				});
				it('should log replacement', () => {
					expect(logMock).toHaveBeenCalled();
				});
			});
		});
	});
	describe('validTransactionData()', () => {
		let wallet, transaction, mineReward;

		beforeEach(() => {
			wallet = new Wallet();
			transaction = wallet.createTransaction({
				recipient: 'random-recipient-pubkey',
				amount: 50,
			});
			mineReward = Transaction.rewardTransaction({
				minerWallet: wallet,
			});
		});

		describe('transaction data is valid', () => {
			it('should return true', () => {
				secondBC.addBlock({
					data: [transaction, mineReward],
				});

				// relying on newBlockchain's history
				expect(
					newBlockchain.validTransactionData({
						chain: secondBC.chain,
					})
				).toBe(true);
			});
		});

		// invalid cases
		describe('the transaction data has multiple rewards', () => {
			it('returns false', () => {
				secondBC.addBlock({
					data: [transaction, mineReward, mineReward],
				});
				// relying on newBlockchain's history
				expect(
					newBlockchain.validTransactionData({
						chain: secondBC.chain,
					})
				).toBe(false);
			});
		});

		describe('the transaction data has at least one changed outputMap', () => {
			describe('the transaction is not a reward transaction', () => {
				it('should return false', () => {
					transaction.outputMap[wallet.publicKey] = 1234;
					secondBC.addBlock({
						data: [transaction, mineReward],
					});
					expect(
						newBlockchain.validTransactionData({
							chain: secondBC.chain,
						})
					).toBe(false);
				});
			});
			describe('the transaction is a reward transaction', () => {
				it('should return false', () => {
					mineReward.outputMap[wallet.publicKey] = 1234;
					secondBC.addBlock({ data: [transaction, mineReward] });
					expect(
						newBlockchain.validTransactionData({
							chain: secondBC.chain,
						})
					).toBe(false);
				});
			});
		});

		describe('the transaction data has changed input', () => {
			it('should return false', () => {
				wallet.balance = 2000;
				const tamperedOutputMap = {
					[wallet.publicKey]: 1900,
					randomRecipient: 100,
				};
				const tamperedTransaction = {
					input: {
						timestamp: Date.now(),
						amount: wallet.balance,
						address: wallet.publicKey,
						signature: wallet.sign({ data: tamperedOutputMap }),
					},
					outputMap: tamperedOutputMap,
				};

				secondBC.addBlock({
					data: [tamperedTransaction, mineReward],
				});
				expect(
					newBlockchain.validTransactionData({
						chain: secondBC.chain,
					})
				).toBe(false);
			});
		});

		describe('a block has multiple identical transactions', () => {
			it('should return false', () => {
				mineReward.outputMap[wallet.publicKey] = 1234;
				secondBC.addBlock({
					data: [transaction, transaction, mineReward],
				});
				expect(
					newBlockchain.validTransactionData({
						chain: secondBC.chain,
					})
				).toBe(false);
			});
		});
	});
});
