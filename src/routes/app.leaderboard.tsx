import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/leaderboard")({ component: Leaderboard });

type Row = { id: string; name: string | null; total_earned: number };

function Leaderboard() {
  const navigate = useNavigate();
  const { userId } = useApp();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("id,name,total_earned")
      .order("total_earned", { ascending: false }).limit(50)
      .then(({ data }) => { setRows((data ?? []) as Row[]); setLoading(false); });
  }, []);

  return (
    <div className="bg-background min-h-full">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-xl font-bold text-brand-foreground">Leaderboard</h1>
      </header>

      <section className="px-4 pt-5 pb-10">
        <div className="bg-card border border-border rounded-2xl p-4 card-shadow flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-brand" />
          <p className="text-sm">Top earners by lifetime reward points. Updated periodically.</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => {
              const me = r.id === userId;
              return (
                <li key={r.id} className={`flex items-center gap-3 rounded-xl p-3 border ${me ? "border-brand bg-brand/5" : "border-border bg-card"} card-shadow`}>
                  <span className="h-8 w-8 rounded-full brand-bg text-brand-foreground font-bold flex items-center justify-center text-sm">{i + 1}</span>
                  <span className="flex-1 font-semibold text-sm truncate">{r.name ?? "Member"} {me && <span className="text-brand text-xs">(you)</span>}</span>
                  <span className="font-extrabold tabular-nums">{r.total_earned.toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
