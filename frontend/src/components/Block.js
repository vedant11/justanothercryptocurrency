// react
import React from 'react';
import { Button } from 'react-bootstrap';

// components
import Transaction from './Transaction';

function Block({ block }) {
	function displayTransaction() {
		console.log('ran');
		document.getElementById(
			`${block.hash.substring(0, 20)}-all-transactions`
		).style.display = 'block';
	}

	return (
		<div className='border m-2 p-4 border-dark rounded'>
			Hash: {`${block.hash.substring(0, 20)}`}
			<br />
			Timestamp: {block.timestamp}
			<br />
			Transaction:
			<div
				id={`${block.hash.substring(0, 20)}-all-transactions`}
				style={{ display: 'none' }}>
				{typeof block.data !== 'string'
					? block.data.map((transactionData) => (
							<Transaction transactionData={transactionData} />
					  ))
					: block.data}
			</div>
			<Button onClick={displayTransaction}>Show more</Button>
			<br />
		</div>
	);
}

export default Block;
