import { BookOpenTextIcon } from "lucide-react";
import type { DocSection } from "@/lib/doc-types";

export function SectionDocs({ docs }: { docs?: DocSection[] }) {
  if (!docs || docs.length === 0) return null;

  return (
    <aside className="w-80 shrink-0 rounded-xl bg-card ring-1 ring-foreground/10 overflow-y-auto p-6">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b">
        <BookOpenTextIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Docs</span>
      </div>
      <div className="flex flex-col gap-5">
        {docs.map((doc) => (
          <DocBlock key={doc.heading} {...doc} />
        ))}
      </div>
    </aside>
  );
}

function DocBlock({ heading, text, code }: DocSection) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
      {text && <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>}
      {code && (
        <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
