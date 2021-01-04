const { verifySign } = require('../util/elliptic');
const { Transaction } = require('../wallet/transaction');
const { Wallet } = require('../wallet/wallet');
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
	describe('input', () => {
		it('should have `input` ', () => {
			expect(transaction).toHaveProperty('input');
		});
		it('should have `timestamp` in `input`', () => {
			expect(transaction.input).toHaveProperty('timestamp');
		});
		it('should set the `amount` to senderWallet balance', () => {
			expect(transaction.input.amount).toEqual(senderWallet.balance);
		});
		it('should set `address` to senderWallet publicKey', () => {
			expect(transaction.input.address).toEqual(senderWallet.publicKey);
		});
		it('signs the transaction properly', () => {
			expect(
				verifySign({
					publicKey: senderWallet.publicKey,
					data: transaction.outputMap,
					signature: transaction.input.signature,
				})
			).toBe(true);
		});
	});
	describe('validTransaction()', () => {
		describe('when the transaction is valid', () => {
			it('should return true', () => {
				expect(Transaction.validTransaction({ transaction })).toBe(
					true
				);
			});
		});
		describe('when the transaction is invalid', () => {
			describe('and outputMap is invalid', () => {
				it('should return false', () => {
					transaction.outputMap[senderWallet.publicKey] = 9999999;
					expect(Transaction.validTransaction({ transaction })).toBe(
						false
					);
				});
			});
			describe('transaction input signature is invalid', () => {
				it('should return false', () => {
					transaction.input.signature = new Wallet().sign('bs');
					expect(Transaction.validTransaction({ transaction })).toBe(
						false
					);
				});
			});
		});
	});
});
