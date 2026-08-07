import { createContext, useContext } from "react";
import type { Profile } from "@/lib/auth";

export type AppCtx = {
  profile: Profile | null;
  userId: string | null;
  refresh: () => Promise<void>;
  loading: boolean; // Changed from isLoading to loading for consistency
};

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  if (!ctx) {
    return {
        profile: null,
        userId: null,
        refresh: async () => {},
        loading: true
    };
  }
  return ctx;
}
