import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// הוספת error handler גלובלי
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting React application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  
  console.log('Root created successfully');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // הצג שגיאה בHTML אם React נכשל
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 20px;
        text-align: center;
        font-family: Arial, sans-serif;
      ">
        <h1 style="color: #f44336; margin-bottom: 20px;">שגיאה בטעינת האפליקציה</h1>
        <p style="color: #666; margin-bottom: 20px;">אירעה שגיאה בעת טעינת האפליקציה. אנא רענן את הדף.</p>
        <button 
          onclick="window.location.reload()" 
          style="
            padding: 10px 20px;
            background: #2196f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          רענן דף
        </button>
        <pre style="
          margin-top: 20px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 12px;
          text-align: left;
          max-width: 80%;
          overflow: auto;
        ">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    `;
  }
}