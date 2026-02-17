import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

console.log('Iniciando aplicação...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Erro fatal:', error);
  document.body.innerHTML = `<div style="color: #ef4444; padding: 20px; font-family: sans-serif;">
    <h1>Erro Fatal na Aplicação</h1>
    <p>Ocorreu um erro ao iniciar. Por favor, verifique o console do navegador.</p>
    <pre style="background: #f1f5f9; padding: 10px; border-radius: 4px;">${error}</pre>
  </div>`;
}
