import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Emailed links point at the site root (the static host only serves "/"):
// "/?invite=<token>" opens registration, "/?reset=<token>" opens the password reset page
const query = new URLSearchParams(window.location.search);
const inviteToken = query.get('invite');
const resetToken = query.get('reset');
if (inviteToken) {
  window.history.replaceState(null, '', `/#/register?token=${encodeURIComponent(inviteToken)}`);
} else if (resetToken) {
  window.history.replaceState(null, '', `/#/reset-password?token=${encodeURIComponent(resetToken)}`);
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

} catch (error) {
  console.error('Failed to initialize React app:', error);

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
        <h1 style="color: #1A1F2B; margin-bottom: 20px;">שגיאה בטעינת האפליקציה</h1>
        <p style="color: #666; margin-bottom: 20px;">אירעה שגיאה בעת טעינת האפליקציה. אנא רענן את הדף.</p>
        <button 
          onclick="window.location.reload()" 
          style="
            padding: 10px 20px;
            background: #1F4E8C;
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