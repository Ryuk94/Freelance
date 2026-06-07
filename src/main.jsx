import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

async function clearLocalPwaState() {
  if (typeof window === 'undefined') {
    return;
  }

  const { hostname, origin } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

  if (!isLocalHost) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker?.getRegistrations?.();
    await Promise.all((registrations ?? []).map((registration) => registration.unregister()));
  } catch {
    // Best effort only.
  }

  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    // Best effort only.
  }

  if (origin.includes('127.0.0.1') || origin.includes('localhost')) {
    try {
      window.sessionStorage.setItem('freelanceos.pwaCleared', '1');
    } catch {
      // Ignore.
    }
  }
}

void clearLocalPwaState();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
