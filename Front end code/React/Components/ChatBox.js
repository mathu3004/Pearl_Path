import React, { useState } from 'react';
import Message from './Message';

const ChatBox = ({ toggleChat, position }) => {
  const [messages, setMessages] = useState([
    { text: "Hi! I’m Pearlie from Pearl Path. How can I help you today?", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');
    setTimeout(() => {
      setMessages([...messages, { text: input, sender: 'user' }, { text: "I'm still learning! 😊", sender: 'bot' }]);
    }, 1000);
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
