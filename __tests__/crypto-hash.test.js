const cryptoHash = require('../blockchain_logic/crypto-hash');

describe('cryptoHash()', () => {
	it('generates sha-256', () => {
		expect(cryptoHash('foo')).toEqual(
			'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b'
		);
	});

	it('produces same hash with any param order', () => {
		expect(cryptoHash('1', '2', '3')).toEqual(cryptoHash('2', '1', '3'));
	});
});
