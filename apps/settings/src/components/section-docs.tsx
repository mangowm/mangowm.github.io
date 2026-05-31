import { BookOpenTextIcon } from "lucide-react";
import { marked } from "marked";
import { useMemo } from "react";
import "./section-docs.css";

marked.setOptions({ gfm: true, breaks: false });

export function SectionDocs({ markdown }: { markdown?: string }) {
  const html = useMemo(() => {
    if (!markdown) return "";
    const result = marked.parse(markdown);
    if (typeof result !== "string") throw new Error("marked returned async unexpectedly");
    return result;
  }, [markdown]);

  if (!html) return null;

  return (
    <aside className="docs-panel w-80 shrink-0 rounded-xl bg-card ring-1 ring-foreground/10 overflow-y-auto p-6">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b">
        <BookOpenTextIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Docs</span>
      </div>
      <div
        className="docs-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </aside>
  );
}

export function SectionDocsPage({ markdown }: { markdown?: string }) {
  const html = useMemo(() => {
    if (!markdown) return "";
    const result = marked.parse(markdown);
    if (typeof result !== "string") throw new Error("marked returned async unexpectedly");
    return result;
  }, [markdown]);

  if (!html) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="docs-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
