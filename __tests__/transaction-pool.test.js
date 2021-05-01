const { TransactionPool } = require('../wallet/transactionPool');
const { Transaction } = require('../wallet/transaction');
const { Wallet } = require('../wallet/wallet');
describe('TransactionPool', () => {
	let transactionPool, transaction, senderWallet;
	beforeEach(() => {
		senderWallet = new Wallet();
		transactionPool = new TransactionPool();
		transaction = new Transaction({
			senderWallet,
			recipient: 'justanotherrecipient',
			amount: 50,
		});
	});
	describe('set transaction', () => {
		it('should add transaction to the transactionpool object', () => {
			transactionPool.addTransaction(transaction);
			expect(transactionPool.transactionsMap[transaction.id]).toBe(
				transaction
			);
		});
	});
	describe('existingTransaction()', () => {
		it('should return an existing transaction if present', () => {
			transactionPool.addTransaction(transaction);
			expect(
				transactionPool.existingTransaction({
					inputAddress: senderWallet.publicKey,
				})
			).toBe(transaction);
		});
	});
	describe('fetchvalidTransactions()', () => {
		let validTransactions;
		beforeEach(() => {
			validTransactions = [];
			for (let i = 0; i < 10; i++) {
				transaction = new Transaction({
					senderWallet,
					recipient: 'random-recipient',
					amount: 10,
				});

				if ((i == 1) | (i == 4) | (i == 7)) {
					// invalid input amount
					transaction.input.amount = 100000;
				} else if ((i == 2) | (i == 5)) {
					// tampered signnature
					transaction.input.signature = new Wallet().sign(
						'random-sign'
					);
				} else {
					// normal valid transactions are stored in a variable
					validTransactions.push(transaction);
				}
				transactionPool.addTransaction(transaction);
			}
		});
		it('should return valid transactions', () => {
			expect(transactionPool.fetchValidTransactions()).toEqual(
				validTransactions
			);
		});
	});
});
