import React, { useEffect, useState } from 'react';
import { BLOCKS_API } from '../../config';

function Blocks() {
	const [blocks, setBlocks] = useState([]);

	useEffect(() => {
		fetch(BLOCKS_API)
			.then((res) => res.json())
			.then((res) => setBlocks(res['chain']));
	}, []);
	const Blocks = blocks.map((block) => {
		return (
			<div key={block.hash} className='border m-2 p-4'>
				{block.hash}
			</div>
		);
	});
	return (
		<div className='row justify-content-center m-4 p-3'>
			<div className='col-md-auto border'>
				<h2>Blocks</h2>
				{blocks ? Blocks : null}
			</div>
		</div>
	);
}

export default Blocks;
