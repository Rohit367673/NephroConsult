import React, { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export const TawkToChat: React.FC = () => {
  useEffect(() => {
    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/67039f1537379df10df28a27/1i9gfli65';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Customize the widget for your nephrology platform
    window.Tawk_API.onLoad = function() {
      // Set visitor information
      window.Tawk_API.setAttributes({
        'name': 'Visitor',
        'email': '',
        'hash': ''
      }, function(error: any) {
        if (error) {
          console.log('Tawk.to error:', error);
        }
      });

      // Add custom CSS to match your brand
      window.Tawk_API.customStyle = {
        visibility: {
          desktop: {
            position: 'br', // bottom right
            xOffset: 20,
            yOffset: 20
          },
          mobile: {
            position: 'br',
            xOffset: 10,
            yOffset: 10
          }
        }
      };
    };

    // Add predefined messages for your nephrology consultation platform
    window.Tawk_API.onChatMaximized = function() {
      // Send a welcome message when chat is opened
      setTimeout(() => {
        if (window.Tawk_API && window.Tawk_API.addEvent) {
          window.Tawk_API.addEvent('Welcome', {
            'message': 'Welcome to NephroConsult! I can help you with booking consultations, understanding our services, and answering questions about Dr. Ilango\'s nephrology practice.'
          });
        }
      }, 1000);
    };

    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    }

    // Cleanup function
    return () => {
      // Remove script when component unmounts
      const scripts = document.querySelectorAll('script[src*="tawk.to"]');
      scripts.forEach(s => s.remove());
      
      // Clean up global variables
      if (window.Tawk_API) {
        delete window.Tawk_API;
      }
      if (window.Tawk_LoadStart) {
        delete window.Tawk_LoadStart;
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkToChat;
