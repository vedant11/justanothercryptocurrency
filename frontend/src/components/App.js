import React, { useEffect, useState } from 'react';
import { WALLET_INFO_API } from '../../config';

function App() {
	const [walletInfo, setWalletInfo] = useState({
		address: '000x1b2',
		balance: 100,
	});

	useEffect(() => {
		fetch(WALLET_INFO_API)
			.then((res) => res.json())
			.then((res) => {
				setWalletInfo({
					address: res['address'].slice(0, 6),
					balance: res['balance'],
				});
			});
	}, []);
	const { address, balance } = walletInfo;
	return (
		<>
			<h2>walletInfo</h2>
			<div>Address: {address},</div>
			<div>Balance: {balance},</div>
		</>
	);
}

export default App;
