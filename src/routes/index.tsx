import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/terminal/dashboard";
import { getMacroTerminal } from "@/lib/macro/api";

export const Route = createFileRoute("/")({
  loader: () => getMacroTerminal({ data: { refresh: false } }),
  component: Home,
  pendingComponent: Pending,
});

function Home() {
  const initial = Route.useLoaderData();
  return <Dashboard initial={initial} />;
}

function Pending() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <p className="font-mono text-xs tracking-widest text-gold">AURUM</p>
      <h1 className="mt-2 text-2xl font-medium text-balance">Terminal makro XAUUSD</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Mengambil Treasury, BLS, New York Fed, CFTC, dan kuotasi vendor. Kolom kosong tetap kosong.
      </p>
    </main>
  );
}
