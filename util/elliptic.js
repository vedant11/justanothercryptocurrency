const EC = require('elliptic').ec;
const cryptoHash = require('../blockchain_logic/crypto-hash');

const ec = new EC('secp256k1');

const verifySign = ({ publicKey, data, signature }) => {
	// creating new key instance from publicKey data that will
	// help us to verify using inbuilit verify method
	console.log(
		publicKey !== undefined,
		data !== undefined,
		signature !== undefined
	);
	const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
	return keyFromPublic.verify(cryptoHash(data), signature);
};
module.exports = { ec, verifySign, cryptoHash };
