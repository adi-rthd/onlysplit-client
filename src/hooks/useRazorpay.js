import { useEffect, useState } from 'react';

/**
 * Custom hook to dynamically load the Razorpay checkout script.
 */
export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If already loaded
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay SDK');
    
    document.body.appendChild(script);

    return () => {
      // document.body.removeChild(script); // Optional: cleanup on unmount
    };
  }, []);

  return isLoaded;
};
