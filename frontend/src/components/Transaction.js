import React from 'react';

function Transaction({ transactionData }) {
	const { input, outputMap } = transactionData;
	const recipients = Object.keys(outputMap);
	return (
		<>
			From: {`${input.address.substring(0, 20)}...`} | Balance:{' '}
			{input.amount}
			{recipients.map((recipient) => (
				<div>
					To: {`${recipient.substring(0, 20)}...`} | Sent:{' '}
					{outputMap[recipient]}
				</div>
			))}
			<hr />
		</>
	);
}

export default Transaction;
