import React, { useState, useEffect } from 'react';
import ChatBox from './ChatBox';

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleMouseDown = (e) => {
    if (isChatOpen) return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isChatOpen) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isChatOpen]);

  return (
    <>
      <div
        className="widget"
        style={{ left: `${position.x}px`, top: `${position.y}px`, cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onClick={toggleChat}
      >
        💬
      </div>
      {isChatOpen && (
        <ChatBox
          toggleChat={toggleChat}
          position={{ x: position.x + 15, y: position.y - 550 }} // Adjust the position to be above the widget
        />
      )}
    </>
  );
};

export default ChatWidget;
