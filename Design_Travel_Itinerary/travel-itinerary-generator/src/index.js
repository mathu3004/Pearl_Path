// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
  
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
