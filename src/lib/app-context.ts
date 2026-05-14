import { createContext, useContext } from "react";
import type { Profile } from "@/lib/auth";

export type AppCtx = {
  profile: Profile | null;
  userId: string;
  refresh: () => Promise<void>;
};

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside /app");
  return ctx;
}
