const crypto = require('crypto');

const cryptoHash = (...inputs) => {
	// Any order of inputs is valid
	const hash = crypto.createHash('sha256');
	hash.update(
		inputs
			.map((input) => JSON.stringify(input))
			.sort()
			.join('-')
	);
	const hashValue = hash.digest('hex');
	return hashValue;
};

module.exports = cryptoHash;
