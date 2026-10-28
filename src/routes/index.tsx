import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KhetSathi — Farm management made simple" },
      { name: "description", content: "Manage farms, crops, inputs and equipment bookings in one place." },
      { property: "og:title", content: "KhetSathi — Farm management made simple" },
      { property: "og:description", content: "Manage farms, crops, inputs and equipment bookings in one place." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">KhetSathi</p>
      <h1 className="font-display max-w-2xl text-5xl leading-tight text-foreground md:text-6xl">
        Your farm, crops and bookings — in one field notebook.
      </h1>
      <p className="max-w-md text-muted-foreground">Track farms, crop stages, seeds and fertilizers, and book equipment.</p>
      <Button asChild size="lg"><Link to="/dashboard">Open dashboard</Link></Button>
    </main>
  );
}
