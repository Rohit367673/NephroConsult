
  import React, { StrictMode, Suspense } from "react";
  import { createRoot } from "react-dom/client";
  import { HelmetProvider } from "react-helmet-async";
  import App from "./App";
  import "./index.css";

  // Loading component for suspense fallback
  const AppLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>
  );

  // Register service worker for PWA support
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
    });
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
  