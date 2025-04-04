import React, { useState } from 'react';
import Message from './Message';

const ChatBox = ({ toggleChat, position }) => {
  const [messages, setMessages] = useState([
    { text: "Hi! I’m Pearlie from Pearl Path. How can I help you today?", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');

    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    setMessages([...messages, { text: input, sender: 'user' }, { text: data.response, sender: 'bot' }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="chatbox"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="chat-header">
        Pearl Chat
        <span className="close-btn" onClick={toggleChat}>✖</span>
      </div>
      <div className="chat-container">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
