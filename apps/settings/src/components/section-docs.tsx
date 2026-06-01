import { marked } from "marked";
import { useMemo } from "react";
import "./section-docs.css";

marked.setOptions({ gfm: true, breaks: false });

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
      <div className="docs-content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
