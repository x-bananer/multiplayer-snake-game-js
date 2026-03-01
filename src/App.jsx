import Canvas from './canvas.jsx';

import './App.css';

function App() {
	const GRID_WIDTH = 400;
	const GRID_HEIGHT = 400;

	return (
		<div className="app">
			<Canvas width={GRID_WIDTH} height={GRID_HEIGHT}></Canvas>
		</div>
	)
}

export default App
