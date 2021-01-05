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
const pubsub = new PubSub({ blockchain });
const transactionPool = new TransactionPool();
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
	res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
	const { amount, recipient } = req.body;
	const transaction = wallet.createTransaction({ amount, recipient });
	transactionPool.addTransaction(transaction);
	console.log('transaction made and added to pool', transactionPool);
	res.json({ transaction });
});

const syncChains = () => {
	request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, res, body) => {
		if (!err && res.statusCode === 200) {
			const rootNodeChain = JSON.parse(body);
			console.log('replacing chain on sync', rootNodeChain);
			blockchain.replaceChain(rootNodeChain);
		}
	});
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true')
	PEER_PORT = PORT + Math.ceil(Math.random() * 1000);
if (PEER_PORT === undefined) PEER_PORT = PORT;
app.listen(PEER_PORT, () => {
	console.log(`app started at ${PEER_PORT} `);
	// syncing on start only for non root nodes
	if (PEER_PORT !== PORT) syncChains();
});
