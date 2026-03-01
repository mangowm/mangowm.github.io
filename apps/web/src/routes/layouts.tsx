import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShowcase } from "@/components/layouts/LayoutShowcase";

export const Route = createFileRoute("/layouts")({
  component: LayoutsPage,
});

function LayoutsPage() {
  return (
    <div className="min-h-screen bg-fd-background px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="fixed left-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-background px-4 py-2 text-sm font-medium text-fd-foreground shadow-md backdrop-blur-md transition-colors hover:text-fd-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>
      <div className="container mx-auto max-w-6xl pt-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Layouts</h1>
            <p className="text-fd-muted-foreground">
              Interactive showcase of MangoWM window layouts. Select a layout type and
              adjust parameters to see how windows are arranged.
            </p>
          </div>
          <LayoutShowcase />
        </div>
      </div>
    </div>
  );
}
