import { useCallback, useRef } from 'react';

/**
 * Prefetches a route's JavaScript chunk on hover/focus
 * Uses dynamic import to trigger Vite's lazy chunk loading
 */
export function useRoutePrefetch() {
  const prefetched = useRef<Set<string>>(new Set());

  const prefetchRoute = useCallback(async (path: string) => {
    if (prefetched.current.has(path)) return;
    prefetched.current.add(path);

    try {
      // Map routes to their lazy-loaded components
      const routeImports: Record<string, () => Promise<any>> = {
        '/projects': () => import('@/pages/projects/ProjectsPublicListPage'),
        '/plans': () => import('@/features/pricing'),
        '/legal': () => import('@/features/legal'),
        '/login': () => import('@/pages/auth/LoginPage'),
        '/register': () => import('@/pages/auth/RegisterPage'),
        '/health': () => import('@/pages/HealthPage'),
        '/admin/dashboard': () => import('@/features/dashboard/pages/DashboardPage'),
        '/admin/projects': () => import('@/pages/admin/AdminProjectsPage'),
        '/admin/rules': () => import('@/pages/admin/RulesManagePage'),
        '/admin/settings': () => import('@/pages/admin/SettingsPage'),
      };

      const importFn = routeImports[path];
      if (importFn) {
        await importFn();
      }
    } catch (error) {
      console.warn(`Failed to prefetch route ${path}:`, error);
    }
  }, []);

  return { prefetchRoute };
}
