
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root para montar la aplicación");
}

// Registro del Service Worker optimizado para GitHub Pages
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usamos una ruta relativa al directorio actual para el SW
    const swUrl = new URL('./sw.js', import.meta.url).href;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(err => {
        console.warn('Registro de SW omitido o fallido (esto es normal en algunos entornos de desarrollo):', err);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
