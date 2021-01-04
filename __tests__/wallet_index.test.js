const { Wallet } = require('../wallet/wallet');
const { verifySign } = require('../util/elliptic');
describe('Wallet', () => {
	let wallet;
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
});
