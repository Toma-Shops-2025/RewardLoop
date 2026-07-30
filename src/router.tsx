import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.protocol === 'capacitor:')
      ? createHashHistory()
      : undefined
  });

  return router;
};
