import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { taskMessageService } from './services';
import { showingService } from './services';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 