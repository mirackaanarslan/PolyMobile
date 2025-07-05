import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletProvider } from './components/WalletProvider';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
); 