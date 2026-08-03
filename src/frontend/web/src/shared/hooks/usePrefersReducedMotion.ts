import { useState, useEffect } from 'react';

export function usePrefersReducedMotion() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMatches(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Use modern addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // @ts-ignore - for older browsers
      mediaQuery.addListener(handler);
      // @ts-ignore
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return matches;
}
