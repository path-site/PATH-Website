import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ADMIN_GATEWAY_SECRET, unlockAdminGateway } from './config/adminConfig';

// Secret Admin Gateway: Pre-render URL rewrite
// When the secret link is opened, immediately unlock the session and replace
// the address bar URL with /admin/login so the secret link stays completely hidden.
try {
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const secretPath = ADMIN_GATEWAY_SECRET.replace(/\/+$/, '');

  if (currentPath === secretPath || currentPath.startsWith(`${secretPath}/`)) {
    unlockAdminGateway();
    const hasToken = !!localStorage.getItem('path_admin_token');
    window.history.replaceState(null, '', hasToken ? '/admin' : '/admin/login');
  }
} catch (e) {
  // Gracefully fallback
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
