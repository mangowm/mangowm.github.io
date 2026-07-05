import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/releases")({
  component: ReleasesPage,
});

function ReleasesPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-4">Releases</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}
