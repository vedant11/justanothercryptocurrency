const { Transaction } = require('../wallet/transaction');
const { Wallet } = require('../wallet/index');
describe('Transaction()', () => {
	let senderWallet, recipient, amount, transaction;
	beforeEach(() => {
		senderWallet = new Wallet();
		(recipient = 'rec-pub-key'), (amount = 50);
		transaction = new Transaction({
			senderWallet,
			recipient,
			amount,
		});
	});

	it('has an id', () => {
		expect(transaction).toHaveProperty('id');
	});
	describe('outputMap', () => {
		it('has an `outputMap`', () => {
			expect(transaction).toHaveProperty('outputMap');
		});
		it('should output the amount to the recipient', () => {
			expect(transaction.outputMap[recipient]).toEqual(amount);
		});
		it('should output the balance of `senderWallet`', () => {
			expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
				senderWallet.balance - amount
			);
		});
	});
});
