// modules
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import WalletInfo from './WalletInfo.js';
import Blocks from './Blocks.js';

// styling
import 'react-toastify/dist/ReactToastify.css';
import '../static/css/App.css';

// init
toast.configure();

function App() {
	return (
		<div className='container'>
			<WalletInfo />
			<Blocks />
		</div>
	);
}

export default App;
