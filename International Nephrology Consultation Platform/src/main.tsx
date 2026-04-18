import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { isIOSSafari } from "./utils/safariCompat";

// Loading component for suspense fallback
const AppLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
  </div>
);

// Register service worker for PWA support (skip on iOS Safari if auth reset recently)
const iosAuthReset = sessionStorage.getItem('ios_safari_auth_reset');
const shouldSkipSW = isIOSSafari() && iosAuthReset;

if ('serviceWorker' in navigator && import.meta.env.PROD && !shouldSkipSW) {
  window.addEventListener('load', () => {
    // Clear old caches to prevent Safari white screen from stale content
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName !== 'nephroconsult-v3') {
            console.log('Deleting old cache:', cacheName);
            caches.delete(cacheName);
          }
        });
      });
    }

    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
} else if (shouldSkipSW) {
  console.log('🍎 iOS Safari auth reset detected - skipping service worker registration for fresh auth');
  // Clear the flag so next load can use service worker
  sessionStorage.removeItem('ios_safari_auth_reset');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <Suspense fallback={<AppLoader />}>
        <App />
      </Suspense>
    </HelmetProvider>
  </StrictMode>
);