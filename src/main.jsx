import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App.jsx';
import { initializeTheme } from './utils';
import { BackendProvider } from './api';

initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BackendProvider>
        <App />
      </BackendProvider>
    </BrowserRouter>
  </StrictMode>
);
