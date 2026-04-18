// Safari compatibility utilities
export const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Detect iOS specifically (iPhone, iPad, iPod)
export const isIOS = () => {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detect iOS Safari specifically
export const isIOSSafari = () => {
  return isIOS() && isSafari();
};

// Clear all storage for iOS Safari to fix auth issues
export const clearIOSStorage = async () => {
  if (!isIOS()) return;
  
  console.log('🧹 Clearing iOS Safari storage for fresh auth...');
  
  // Clear all cookies
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear IndexedDB databases (Firebase auth stores here)
  if ('indexedDB' in window) {
    try {
      const databases = await indexedDB.databases?.() || [];
      databases.forEach(db => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    } catch (e) {
      console.log('Could not clear IndexedDB:', e);
    }
  }
  
  // Unregister service workers (they can cache old auth state)
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('✅ Service workers unregistered');
    } catch (e) {
      console.log('Could not unregister service workers:', e);
    }
  }
  
  console.log('✅ iOS storage cleared');
};

// Complete reset for iOS Safari auth issues
export const resetIOSSafariAuth = async () => {
  await clearIOSStorage();
  
  // Add a flag to prevent auto-login on next load
  sessionStorage.setItem('ios_safari_auth_reset', Date.now().toString());
  
  // Reload the page
  window.location.href = window.location.origin + '?fresh=' + Date.now();
};

export const getSafariCompatibleFetchOptions = (options: RequestInit = {}) => {
  const safariOptions: RequestInit = {
    ...options,
    credentials: 'include',
    mode: 'cors',
    cache: 'no-cache',
  };

  // Safari-specific headers
  if (isSafari()) {
    safariOptions.headers = {
      ...safariOptions.headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
  }

  return safariOptions;
};

// Helper to make Safari-compatible fetch requests
export const safariCompatibleFetch = async (url: string, options: RequestInit = {}) => {
  const compatibleOptions = getSafariCompatibleFetchOptions(options);
  
  console.log('🍎 Safari-compatible fetch:', {
    url,
    options: compatibleOptions,
    isSafari: isSafari()
  });

  try {
    const response = await fetch(url, compatibleOptions);
    
    if (!response.ok) {
      console.error('❌ Safari fetch failed:', {
        status: response.status, 
        statusText: response.statusText,
        url,
        isSafari: isSafari()
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Safari fetch error:', error, {
      url,
      isSafari: isSafari()
    });
    throw error;
  }
};
