import { createContext, useContext } from "react";
import type { Profile } from "@/lib/auth";

export type AppCtx = {
  profile: Profile | null;
  userId: string | null;
  refresh: () => Promise<void>;
  isLoading?: boolean;
};

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  // SAFE MODE: Don't crash if context is missing, return a loading state instead
  if (!ctx) {
    return {
        profile: null,
        userId: null,
        refresh: async () => {},
        isLoading: true
    };
  }
  return ctx;
}
