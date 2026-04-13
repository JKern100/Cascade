import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard.jsx';

function App() {
  return <Dashboard />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

export default App;
