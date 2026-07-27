import { useCallback, useRef } from "react";
import { router } from "@/router";

/**
 * Prefetches a route's lazy-loaded chunk on hover.
 * Call this from onMouseEnter on navigation links.
 */
export function useRoutePrefetch() {
  const prefetched = useRef<Set<string>>(new Set());

  const prefetch = useCallback((path: string) => {
    if (prefetched.current.has(path)) return;
    prefetched.current.add(path);

    // React Router v7: trigger lazy route load via internal API
    // We navigate to the route with a no-op to trigger the lazy import
    const route = router.routes.find((r) => r.path === path || (r.path && path.startsWith(r.path.replace(/:.*?(\/|$)/, ''))));
    if (route) {
      // Force load the lazy element by accessing it
      Promise.resolve().then(() => {
        // This triggers the lazy import when the route is matched
        (router as any).loadRoute?.(route.id);
      });
    }
  }, []);

  return { prefetch };
}