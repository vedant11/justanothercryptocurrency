// react
import React, { useEffect, useState } from 'react';

// components
import Block from './Block.js';

// constants
import { BLOCKS_API } from '../../config';

function Blocks() {
	const [blocks, setBlocks] = useState([]);

	useEffect(() => {
		fetch(BLOCKS_API)
			.then((res) => res.json())
			.then((res) => setBlocks(res['chain']));
	}, []);
	const Blocks = blocks.map((block) => {
		return <Block key={block.hash} block={block} />;
	});
	return (
		<div className='row justify-content-center m-4 p-3'>
			<div className='col-md-auto border border-dark rounded'>
				<h2 className='m-2 pb-4 pt-4'>Blocks</h2>
				{blocks ? Blocks : null}
			</div>
		</div>
	);
}

export default Blocks;
