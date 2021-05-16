// react
import React from 'react';
import CustomPopoverElement from './CustomPopoverElement';
function Block({ block }) {
	const stringifiedData = JSON.stringify(block.data, null, 2);

	return (
		<div className='border m-2 p-4 border-dark rounded'>
			Hash: {block.hash}
			<br />
			Timestamp: {block.timestamp}
			<br />
			<CustomPopoverElement
				title='Data'
				data={stringifiedData}
				type='block'
			/>
			<br />
		</div>
	);
}

export default Block;
