const redis = require('redis');

const CHANNELS = {
	TEST: 'TEST',
	BLOCKCHAIN: 'BLOCKCHAIN',
	TRANSACTION: 'TRANSACTION',
};

class PubSub {
	constructor({ blockchain, transactionPool }) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.pub = redis.createClient();
		this.sub = redis.createClient();

		this.subscribeAll();

		this.sub.on('message', (channel, message) => {
			this.handleMessage(channel, message);
		});
	}

	handleMessage(channel, message) {
		// parsedMessage is a blockchain Object
		const parsedMessage = JSON.parse(message);
		switch (channel) {
			case CHANNELS.BLOCKCHAIN: {
				// callback function to clearBlockchainTransactions
				// after local blockchain is updated after `mine-transactions`
				this.blockchain.replaceChain(parsedMessage, () => {
					this.transactionPool.clearBlockchainTransactions({
						// this argument will be an array of latest blocks to let the
						// method know which transactions to delete from the local TransactionPool
						blockchain: parsedMessage,
					});
				});
				break;
			}
			case CHANNELS.TRANSACTION: {
				this.transactionPool.addTransaction(parsedMessage);
				break;
			}
			default:
				break;
		}
	}

	subscribeAll() {
		Object.values(CHANNELS).forEach((channel) => {
			this.sub.subscribe(channel);
		});
	}

	publish({ channel, message }) {
		// to prevent listening to its own publishes
		this.sub.unsubscribe(channel, () => {
			this.pub.publish(channel, message, () => {
				this.sub.subscribe(channel);
			});
		});
	}

	broadcastBlockchain() {
		this.publish({
			channel: CHANNELS.BLOCKCHAIN,
			message: JSON.stringify(this.blockchain),
		});
	}
	broadcastTransaction(transaction) {
		console.log('you shouldnt have called me');
		this.publish({
			channel: CHANNELS.TRANSACTION,
			message: JSON.stringify(transaction),
		});
	}
}
module.exports = PubSub;
