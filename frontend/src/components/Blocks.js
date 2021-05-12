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
		return <div key={block.hash}>{block.hash}</div>;
	});
	return (
		<>
			<h2>Blocks</h2>
			{blocks ? Blocks : null}
		</>
	);
}

export default Blocks;
