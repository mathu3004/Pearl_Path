// src/components/Layout.js
import React from 'react';
import ChatWidget from './ChatWidget';

const Layout = ({ children }) => {
  return (
    <div>
      {children}
      <ChatWidget />
    </div>
  );
};

export default Layout;