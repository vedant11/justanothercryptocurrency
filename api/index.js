const express = require('express');
const request = require('request');
const Blockchain = require('../blockchain_logic/blockchain');
const { PORT } = require('./api_config');
const bodyParser = require('body-parser');
const PubSub = require('./pubsub');
const { TransactionPool } = require('../wallet/transactionPool');
const { Wallet } = require('../wallet/wallet');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });
const wallet = new Wallet();
const ROOT_NODE_ADDRESS = `http://localhost:${PORT}`;
app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
	res.json(blockchain);
});
app.post('/api/mine', (req, res) => {
	const { data } = req.body;
	blockchain.addBlock({ data });
	// to broadcast change in chain to every peer
	pubsub.broadcastBlockchain();
	console.log('broadcasted the chain');
	return res.redirect('/api/blocks');
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
	return res.json({ transactionPool });
});
app.get('/api/transactionPool/validTransactions', (req, res) => {
	const validTransactions = transactionPool.fetchValidTransactions();
	return res.json(validTransactions);
});

const syncWithRoot = () => {
	request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, res, body) => {
		if (!err && res.statusCode === 200) {
			const rootNodeChain = JSON.parse(body);
			console.log('replacing chain on sync', rootNodeChain);
			blockchain.replaceChain(rootNodeChain);
		}
	});
	request(
		{ url: `${ROOT_NODE_ADDRESS}/api/transactionPool-details` },
		(err, res, body) => {
			if (!err && res.statusCode === 200) {
				const transactionsMap = JSON.parse(body).transactionPool
					.transactionsMap;
				console.log('syncing transactionPool', transactionsMap);
				transactionPool.setMap({ transactionsMap });
			}
		}
	);
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true')
	PEER_PORT = PORT + Math.ceil(Math.random() * 1000);
if (PEER_PORT === undefined) PEER_PORT = PORT;
app.listen(PEER_PORT, () => {
	console.log(`app started at ${PEER_PORT} `);
	// syncing on start only for non root nodes
	if (PEER_PORT !== PORT) syncWithRoot();
});
