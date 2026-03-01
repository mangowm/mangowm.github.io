import { createFileRoute, Link } from "@tanstack/react-router";
import { Editor } from "@/components/editor/Editor";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="relative border-b px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-fd-border px-3 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:text-fd-primary"
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
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold">
          Editor
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor />
      </div>
    </div>
  );
}
