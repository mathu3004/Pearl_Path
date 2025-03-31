import React from 'react';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="App">
      <div className="demo-content">
        <h1>Welcome to the Demo Page</h1>
        <p>Click on the chat widget to talk to Pearlie!</p>
      </div>
      <ChatWidget />
    </div>
  );
}

export default App;
