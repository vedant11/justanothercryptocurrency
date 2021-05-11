const { Wallet } = require('../wallet/wallet');
const { verifySign } = require('../util/elliptic');
const { Transaction } = require('../wallet/transaction');
const Blockchain = require('../blockchain_logic/blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
	let wallet;
	// global.console.log = jest.fn();
	// global.console.error = jest.fn();
	beforeEach(() => {
		wallet = new Wallet({});
	});
	it('has balance', () => {
		expect(wallet).toHaveProperty('balance');
	});
	it('should have public key', () => {
		expect(wallet).toHaveProperty('publicKey');
	});
	describe('signing data', () => {
		const data = 'foobar';
		it('verifies a sign ', () => {
			expect(
				verifySign({
					publicKey: wallet.publicKey,
					data,
					signature: wallet.sign({ data }),
				})
			).toBe(true);
		});
		it('does not verify an invalid sign ', () => {
			expect(
				verifySign({
					publicKey: wallet.publicKey,
					data,
					signature: new Wallet().sign({ data }),
				})
			).toBe(false);
		});
	});
	describe('createTransaction()', () => {
		describe('amount exceeds balance', () => {
			it('should throw an error', () => {
				expect(() =>
					wallet.createTransaction({
						amount: 5000,
						recepient: 'cyborg',
					})
				).toThrow('Amount exceeded the balance');
			});
		});
		describe('amount is valid', () => {
			let transaction, amount, recipient;
			beforeEach(() => {
				amount = 50;
				recipient = 'foo-receipient';
				transaction = wallet.createTransaction({ amount, recipient });
			});
			it('creates an instance of transaction', () => {
				expect(transaction instanceof Transaction).toBe(true);
			});
			it('matches transaction input with wallet ', () => {
				expect(transaction.input.address).toEqual(wallet.publicKey);
			});
			it('outputs the amount of recipient ', () => {
				expect(transaction.outputMap[recipient]).toEqual(amount);
			});
		});
	});
	describe('calculateBalance()', () => {
		let blockchain;

		beforeEach(() => {
			blockchain = new Blockchain();
		});

		describe('there are no outputs for the publickey', () => {
			it('returns the `STARTING_BALANCE`', () => {
				expect(
					Wallet.calculateBalance({
						chain: blockchain.chain,
						address: wallet.publicKey,
					})
				).toEqual(STARTING_BALANCE);
			});
		});

		describe('there are two transactions where this is the recipient', () => {
			let transaction1, transaction2;
			let randomAmount = 50;
			beforeEach(() => {
				// two transactions from random wallets
				transaction1 = new Transaction({
					senderWallet: new Wallet(),
					recipient: wallet.publicKey,
					amount: randomAmount,
				});
				transaction2 = new Transaction({
					senderWallet: new Wallet(),
					recipient: wallet.publicKey,
					amount: randomAmount,
				});
				blockchain.addBlock({
					data: [transaction1, transaction2],
				});
			});

			it('should return the balance as the sum of amounts and `STARTING_BALANCE`', () => {
				expect(
					Wallet.calculateBalance({
						chain: blockchain.chain,
						address: wallet.publicKey,
					})
				).toEqual(STARTING_BALANCE + 2 * randomAmount);
			});

			describe('this wallet is also the sender', () => {
				let sendingTransaction;
				let sentAmount = 50;
				beforeEach(() => {
					sendingTransaction = new Transaction({
						senderWallet: wallet,
						recipient: 'random-recipient-address',
						amount: sentAmount,
					});
					blockchain.addBlock({
						data: [sendingTransaction],
					});
				});

				it('should not double count the balance', () => {
					expect(
						Wallet.calculateBalance({
							chain: blockchain.chain,
							address: wallet.publicKey,
						})
					).toEqual(sendingTransaction.outputMap[wallet.publicKey]);
				});

				describe('there are outputs next to block having `sendingTransaction` and mining', () => {
					let recentSendingTransaction, anotherRecievingTransaction;
					let anotherRecievingAmount = 50,
						recentSendingAmount = 50;
					beforeEach(() => {
						/* recentSendingTransaction */
						recentSendingTransaction = new Transaction({
							senderWallet: wallet,
							amount: recentSendingAmount,
							recipient: 'recent-random-recipient',
						});
						minedTransaction = Transaction.rewardTransaction({
							minerWallet: wallet,
						});
						// adding to the blockchain
						blockchain.addBlock({
							data: [recentSendingTransaction, minedTransaction],
						});

						/* anotherRecievingTransaction */
						anotherRecievingTransaction = new Transaction({
							senderWallet: new Wallet(),
							recipient: wallet.publicKey,
							amount: anotherRecievingAmount,
						});
						// adding to the blockchain
						blockchain.addBlock({
							data: [anotherRecievingTransaction],
						});
					});

					it('should include output amounts in the balance', () => {
						expect(
							Wallet.calculateBalance({
								chain: blockchain.chain,
								address: wallet.publicKey,
							})
						).toEqual(
							recentSendingTransaction.outputMap[
								wallet.publicKey
							] +
								minedTransaction.outputMap[wallet.publicKey] +
								anotherRecievingTransaction.outputMap[
									wallet.publicKey
								]
						);
					});
				});
			});
		});
	});
});
