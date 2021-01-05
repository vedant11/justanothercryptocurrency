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
});
