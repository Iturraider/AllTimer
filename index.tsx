
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Registro del Service Worker para PWA con resolución de URL robusta
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Construimos la URL del SW relativa a la ubicación actual de la ventana
    // Esto evita que el empaquetador prefije la URL con dominios externos
    const swUrl = new URL('sw.js', window.location.href).href;
    
    navigator.serviceWorker.register(swUrl).then(registration => {
      console.log('SW registrado con éxito en el alcance:', registration.scope);
    }).catch(err => {
      console.error('Fallo en el registro del SW:', err);
    });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
