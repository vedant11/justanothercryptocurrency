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

		this.sub.on('message', (channel, message) =>
			this.handleMessage(channel, message)
		);
	}

	handleMessage(channel, message) {
		const parsedMessage = JSON.parse(message);
		console.log('received a message', parsedMessage);
		switch (channel) {
			case CHANNELS.BLOCKCHAIN: {
				this.blockchain.replaceChain(parsedMessage);
			}
			case CHANNELS.TRANSACTION: {
				this.transactionPool.addTransaction(parsedMessage);
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
		this.publish({
			channel: CHANNELS.TRANSACTION,
			message: JSON.stringify(transaction),
		});
	}
}
module.exports = PubSub;
