const express = require('express');
const request = require('request');
const { PORT } = require('./api_config');
var path = require('path');
const Blockchain = require('../blockchain_logic/blockchain');
const PubSub = require('./pubsub');
const { TransactionPool } = require('../wallet/transactionPool');
const { Wallet } = require('../wallet/wallet');
const { TransactionMiner } = require('../mining/transactionMiner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });
const wallet = new Wallet();
const transactionMiner = new TransactionMiner({
	blockchain: blockchain,
	wallet: wallet,
	transactionPool: transactionPool,
	pubsub: pubsub,
});

// populating blockchain for testing
const chicWallet = new Wallet();
const counterChicWallet = new Wallet();

const walletTransaction = ({ wlt, recipient, amount }) => {
	const transaction = wlt.createTransaction({
		recipient: recipient,
		amount: amount,
	});
	transactionPool.addTransaction({
		transaction: transaction,
	});
};

const chicAction = () =>
	walletTransaction({
		wlt: wallet,
		recipient: counterChicWallet.publicKey,
		amount: 5,
	});
const counterChicAction = () =>
	walletTransaction({
		wlt: counterChicWallet,
		recipient: chicWallet.publicKey,
		amount: 5,
	});

for (let i = 0; i < 10; i++) {
	if (i % 3 === 0) {
		chicAction();
		chicAction();
	} else {
		counterChicAction();
		counterChicAction();
	}
	console.log(
		Object.values(transactionPool['transactionsMap'])[0]['transaction']
	);
	transactionMiner.mineTransaction();
}

const ROOT_NODE_ADDRESS = `http://localhost:${PORT}`;
let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true')
	PEER_PORT = PORT + Math.ceil(Math.random() * 1000);
if (PEER_PORT === undefined) PEER_PORT = PORT;

express.json();
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/api/blocks', (req, res) => {
	if (PEER_PORT === 3000) {
		res.json(blockchain);
	} else {
		res.json(blockchain)['chain'];
	}
});

app.post('/api/mine', (req, res) => {
	const { data } = req.body;
	blockchain.addBlock({ data });
	// to broadcast change in chain to every peer
	pubsub.broadcastBlockchain();
	return res.redirect('/api/blocks');
});

app.get('/api/mine-transactions', (req, res) => {
	transactionMiner.mineTransaction();

	res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
	const { amount, recipient } = req.body;
	let transaction = transactionPool.existingTransaction({
		inputAddress: wallet.publicKey,
	});
	try {
		if (transaction) {
			transaction.update({
				senderWallet: wallet,
				recipient,
				amount,
			});
		} else {
			transaction = wallet.createTransaction({ amount, recipient });
		}
	} catch (error) {
		return res.status(400).json({ type: 'error', message: error.message });
	}
	transactionPool.addTransaction(transaction);
	pubsub.broadcastTransaction(transaction);
	return res.json({ transaction });
});

app.get('/api/transactionPool-details', (req, res) => {
	// transactionPool.transactionsMap = {};
	return res.json({ transactionPool });
});

app.get('/api/transactionPool/validTransactions', (req, res) => {
	const validTransactions = transactionPool.fetchValidTransactions();
	return res.json(validTransactions);
});

app.get('/api/wallet-info', (req, res) => {
	const senderPublicKey = wallet.publicKey;
	res.json({
		address: senderPublicKey,
		balance: Wallet.calculateBalance({
			chain: blockchain.chain,
			address: senderPublicKey,
		}),
	});
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const syncWithRoot = () => {
	request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, res, body) => {
		if (!err && res.statusCode === 200) {
			// body has the blockchain
			const rootBlockChain = JSON.parse(body);
			blockchain.replaceChain(rootBlockChain);
		}
	});
	request(
		{ url: `${ROOT_NODE_ADDRESS}/api/transactionPool-details` },
		(err, res, body) => {
			if (!err && res.statusCode === 200) {
				const transactionsMap =
					JSON.parse(body).transactionPool.transactionsMap;
				transactionPool.setMap({ transactionsMap });
			}
		}
	);
};

app.listen(PEER_PORT, () => {
	console.log(`app started at ${PEER_PORT} `);
	// syncing on start only for non root nodes
	if (PEER_PORT !== PORT) syncWithRoot();
});
