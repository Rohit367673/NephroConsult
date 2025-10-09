// Safari compatibility utilities
export const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
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
