const { Wallet } = require('../wallet/wallet');
const { verifySign } = require('../util/elliptic');
const { Transaction } = require('../wallet/transaction');
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
});
