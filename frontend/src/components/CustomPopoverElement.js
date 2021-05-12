// react
import React from 'react';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { BsClipboard } from 'react-icons/bs';
import { toast } from 'react-toastify';

function CustomPopoverElement({ title, data, type }) {
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

	const typeMap = {
		'wallet-info': (
			<p>
				<strong>{data.slice(0, 6)}</strong>
				{data.slice(7, data.length)}
			</p>
		),
		block: <pre>{data}</pre>,
	};

	function popover() {
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
				<Popover.Content>{typeMap[type]}</Popover.Content>
			</Popover>
		);
	}
	const PopoverElement = () => (
		<OverlayTrigger trigger='click' placement='right' overlay={popover()}>
			<Button
				className='ml-2 mb-2 pt-0'
				variant='light outline-secondary'
				size='sm'>
				i
			</Button>
		</OverlayTrigger>
	);
	return <PopoverElement />;
}
export default CustomPopoverElement;
