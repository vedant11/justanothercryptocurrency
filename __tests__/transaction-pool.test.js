const { TransactionPool } = require('../wallet/transactionPool');
const { Transaction } = require('../wallet/transaction');
const { Wallet } = require('../wallet/wallet');
describe('TransactionPool', () => {
	let transactionPool, transaction;
	beforeEach(() => {
		transactionPool = new TransactionPool();
		transaction = new Transaction({
			senderWallet: new Wallet(),
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
});
