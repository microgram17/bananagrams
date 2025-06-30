/**
 * Application entry point.
 * 
 * Sets up the React root and renders the main App component.
 * Wrapped in StrictMode for better development-time error checking.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create a root React DOM node at the 'root' element
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the App within StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
