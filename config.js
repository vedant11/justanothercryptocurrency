const MINE_RATE = 1000;
const GENESIS_DATA = {
	// timestamp should be hardcoded to maintain genesis check
	timestamp: 191817,
	lastHash: '____',
	hash: 'hash1',
	data: 'data',
	nonce: 0,
	difficulty: 3,
};
const STARTING_BALANCE = 1000;
const REWARD_INPUT = {
	address: '*official-wallet-public-key*',
};
const MINING_REWARD = 50;

module.exports = {
	GENESIS_DATA,
	MINE_RATE,
	STARTING_BALANCE,
	REWARD_INPUT,
	MINING_REWARD,
};
