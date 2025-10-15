import { useEffect } from 'react';
import { seoConfigs } from '../utils/seoConfigs';

// Hook to dynamically update SEO meta tags based on current page
export const useSEO = (pageKey: string, customConfig?: any) => {
  useEffect(() => {
    // Get SEO config for current page
    const getSEOConfig = (key: string) => {
      const keys = key.split('.');
      let config = seoConfigs as any;
      
      for (const k of keys) {
        if (config && config[k]) {
          config = config[k];
        } else {
          return seoConfigs.home; // fallback to home config
        }
      }
      
      return config;
    };

    const config = customConfig || getSEOConfig(pageKey);
    
    // Update page title
    if (config.title) {
      document.title = config.title;
    }
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && config.description) {
      descriptionMeta.setAttribute('content', config.description);
    }
    
    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta && config.keywords) {
      keywordsMeta.setAttribute('content', config.keywords);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    if (config.canonical) {
      canonicalLink.setAttribute('href', config.canonical);
    }
    
    // Update Open Graph tags
    const updateOGMeta = (property: string, content: string) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`);
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', property);
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute('content', content);
    };
    
    if (config.title) {
      updateOGMeta('og:title', config.title);
      updateOGMeta('twitter:title', config.title);
    }
    
    if (config.description) {
      updateOGMeta('og:description', config.description);
      updateOGMeta('twitter:description', config.description);
    }
    
    if (config.canonical) {
      updateOGMeta('og:url', config.canonical);
      updateOGMeta('twitter:url', config.canonical);
    }
    
  }, [pageKey, customConfig]);
};

// Hook for adding structured data (JSON-LD)
export const useStructuredData = (schema: any) => {
  useEffect(() => {
    if (!schema) return;
    
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema]);
};

export default useSEO;
