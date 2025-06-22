import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Add Inter font for better typography
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
