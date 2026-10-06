import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize comfortable, enlarged font scaling for desktop garage software
const savedScale = localStorage.getItem('garage_pos_font_scale') || '1.1';
document.documentElement.style.setProperty('--app-font-scale', savedScale);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
