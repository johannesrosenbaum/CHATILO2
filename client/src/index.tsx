import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// STARTUP DEBUGGING
console.log('🚀 CLIENT STARTUP DEBUG:');
console.log('   React Version:', React.version);
console.log('   Node Environment:', process.env.NODE_ENV);
console.log('   Base URL:', process.env.PUBLIC_URL);
console.log('   API URL:', process.env.REACT_APP_API_URL);
console.log('   Socket URL:', process.env.REACT_APP_SOCKET_URL);
console.log('   Available env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('   Current hostname:', window.location.hostname);
console.log('   Current port:', window.location.port);
console.log('   Full URL:', window.location.href);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('✅ React DOM root created');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ App component rendered in StrictMode');
