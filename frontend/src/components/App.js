// modules
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import WalletInfo from './WalletInfo.js';
import Blocks from './Blocks.js';

// styling
import 'react-toastify/dist/ReactToastify.css';

// init
toast.configure();

function App() {
	return (
		<>
			<WalletInfo />
			<Blocks />
		</>
	);
}

export default App;
