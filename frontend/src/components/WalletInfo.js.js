// react
import React, { useEffect, useState } from 'react';
import { WALLET_INFO_API } from '../../config';
import CustomPopoverElement from './CustomPopoverElement';

function WalletInfo() {
	const [walletInfo, setWalletInfo] = useState({
		address: '000x1b2',
		balance: 100,
	});

	useEffect(() => {
		fetch(WALLET_INFO_API)
			.then((res) => res.json())
			.then((res) => {
				setWalletInfo({
					address: res['address'],
					balance: res['balance'],
				});
			});
	}, []);
	const { address, balance } = walletInfo;
	return (
		<div className='row justify-content-center m-4 b-1 p-3'>
			<div className='col-md-auto border border-dark rounded'>
				<h2>WalletInfo</h2>

				<div>
					Address: {address.slice(0, 6)},
					<CustomPopoverElement
						title='Address full hash'
						data={address}
						type='wallet-info'
						className='ml-2 mb-2 pt-0'
					/>
				</div>
				<div>Balance: {balance},</div>
			</div>
		</div>
	);
}

export default WalletInfo;
