import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

Amplify.configure(awsExports);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App in BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);