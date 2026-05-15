import { createFileRoute, useNavigate, Outlet, Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legal")({ component: LegalLayout });

const links = [
  { to: "/legal/privacy", label: "Privacy" },
  { to: "/legal/terms", label: "Terms" },
  { to: "/legal/disclaimer", label: "Disclaimer" },
  { to: "/legal/ad-disclosure", label: "Ads" },
  { to: "/legal/data-safety", label: "Data Safety" },
  { to: "/legal/delete-account", label: "Delete Account" },
  { to: "/legal/faq", label: "FAQ" },
] as const;

function LegalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="bg-background min-h-screen">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-xl font-bold text-brand-foreground">Legal & Policies</h1>
      </header>
      <nav className="px-3 pt-3 overflow-x-auto">
        <ul className="flex gap-2 min-w-max">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <li key={l.to}>
                <Link to={l.to} className={`pill-btn px-4 py-2 text-xs ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <main className="px-5 py-5 pb-12 max-w-2xl mx-auto prose-sm">
        <Outlet />
      </main>
    </div>
  );
}
