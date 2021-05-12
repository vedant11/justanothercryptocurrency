import React, { useEffect, useState } from 'react';
import { WALLET_INFO_API } from '../../config';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { BsClipboard } from 'react-icons/bs';
import { toast } from 'react-toastify';

function WalletInfo() {
	const [walletInfo, setWalletInfo] = useState({
		address: '000x1b2',
		balance: 100,
	});
	const copyToClipboard = (str) => {
		const el = document.createElement('textarea');
		toast.success('Copied to the clipboard!', { autoClose: 2000 });
		el.value = str;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	};
	function popover({ title, data }) {
		return (
			<Popover id='popover-basic'>
				<Popover.Title as='h3'>
					<div
						className='popover-heading'
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
						{title}
						<Button onClick={() => copyToClipboard(data)}>
							<BsClipboard />
						</Button>
					</div>
				</Popover.Title>
				<Popover.Content>
					<strong>{data.slice(0, 6)}</strong>
					{data.slice(6, data.length)}
				</Popover.Content>
			</Popover>
		);
	}
	const AddressPopover = () => (
		<OverlayTrigger
			trigger='click'
			placement='right'
			overlay={popover({
				title: 'Address full hash',
				data: walletInfo.address,
			})}>
			<Button
				className='ml-2 mb-2 pt-0'
				variant='light outline-secondary'
				size='sm'>
				i
			</Button>
		</OverlayTrigger>
	);
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
		<>
			<h2>WalletInfo</h2>

			<div>
				Address: {address.slice(0, 6)},
				<AddressPopover />
			</div>
			<div>Balance: {balance},</div>
		</>
	);
}

export default WalletInfo;
