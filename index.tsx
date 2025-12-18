
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root para montar la aplicación");
}

// Registro del Service Worker optimizado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determinamos la ruta base para el SW de forma dinámica
    const swUrl = new URL('./sw.js', window.location.href).href;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker activo:', registration.scope);
      })
      .catch(err => {
        console.warn('Registro de SW omitido:', err);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
