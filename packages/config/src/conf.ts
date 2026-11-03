import type { ConfigDocument, DocumentNode } from "./document";
import type { SourceLocation } from "./types";

const ASSIGNMENT = /^\s*([^=]*?)\s*=\s*(.*)$/;

/** Drop an inline `#` comment. A `#` starts a comment only after whitespace and outside quotes. */
export function stripComment(text: string): string {
  let quote = "";
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#" && index > 0 && /\s/.test(text[index - 1] ?? "")) {
      return text.slice(0, index);
    }
  }
  return text;
}

/** Remove one pair of matching surrounding quotes. */
export function stripQuotes(text: string): string {
  const first = text[0];
  if (text.length >= 2 && (first === '"' || first === "'") && text.endsWith(first)) {
    return text.slice(1, -1).trim();
  }
  return text;
}

/** Parse `.conf` text into a lossless document. */
export function parseConf(text: string, file = ""): ConfigDocument {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const nodes: DocumentNode[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const at: SourceLocation = { file, line: index + 1 };
    const trimmed = raw.trimStart();

    if (trimmed === "") {
      nodes.push({ kind: "blank", raw, at });
      return;
    }

    if (trimmed.startsWith("#")) {
      nodes.push({ kind: "comment", raw, at });
      return;
    }

    const match = ASSIGNMENT.exec(raw);
    if (!match) {
      nodes.push({ kind: "raw", raw, at });
      return;
    }

    const key = (match[1] ?? "").trim();
    const value = stripQuotes(stripComment(match[2] ?? "").trim());
    nodes.push({ kind: "entry", path: [key], value, raw, at });
  });

  return { format: "conf", newline, nodes };
}

/** Write a document back to text, preserving untouched lines exactly. */
export function formatConf(document: ConfigDocument): string {
  return document.nodes.map((node) => node.raw).join(document.newline);
}
